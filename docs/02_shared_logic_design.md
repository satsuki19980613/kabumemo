## 1. 概要

本ドキュメントは、株メモアプリケーションの**Kotlin Multiplatform (KMP)**による`shared`モジュールの設計を定義する。この共有モジュールは、AndroidとiOSで共通して使用されるビジネスロジック、データモデル、状態管理の責務を担う。これにより、プラットフォーム間での一貫した動作を保証し、開発効率を最大化する。

---

## 2. 設計原則

- **単一の真実の源 (Single Source of Truth)**
    - リポジトリ層をアプリケーションデータの唯一の源泉とする。UI層はViewModelを介してリポジトリから提供される状態のみを観測する。
- **リアクティブなデータフロー**
    - データストリームを表現するために**Kotlin Coroutines Flow**を全面的に採用する。Firestoreからのリアルタイムなデータ変更をUIに効率的に伝播させ、リアクティブなUI更新を実現する。
- **クリーンアーキテクチャ**
    - データ層（Data）、ドメイン層（Domain）、プレゼンテーション層（Presentation）の3層に分離し、関心事の分離を徹底する。
- **依存性の注入 (Dependency Injection)**
    - **Koin** を導入し、各コンポーネントの依存関係を外部から注入する。これにより、コードの疎結合化とテストの容易性を高める。

---

## 3. データモデル (Data Models)

Firestoreに保存され、アプリケーション全体で利用されるコアエンティティをKotlinの`data class`で定義する。
```
Kotlin

`// FirebaseのTimestampをKMPで扱うための expect/actual 宣言
expect class Timestamp// ファクター（メモ）のコアモデル
data class Factor(
    val id: String,
    val authorId: String,
    val title: String?,
    val content: String,
    val type: FactorType,
    val createdAt: Timestamp,
    val updatedAt: Timestamp,
    val imageUrl: String?,
    val hashtags: List<String>,
    val targetStock: Stock?,      // INDIVIDUAL_STOCK タイプ用
    val period: DateRange?,       // 影響期間
    val sentiment: Sentiment?     // INDIVIDUAL_STOCK タイプに対する自身の見解
)

// ファクターの種類
enum class FactorType {
    TWEET,            // つぶやき
    INDIVIDUAL_STOCK, // 個別銘柄
    THEME             // テーマ
}

/**
 * 銘柄情報
 * EDINET APIから取得する情報を基に定義
 */
data class Stock(
    val edinetCode: String,      // EDINETコード
    val secCode: String?,        // 証券コード (上場企業のみ)
    val filerName: String,       // 提出者名 (企業名)
    val market: String?          // 市場区分 (例: "プライム市場")
)

// 期間
data class DateRange(
    val start: Timestamp,
    val end: Timestamp
)

// センチメント
enum class Sentiment {
    POSITIVE, // 上昇
    NEUTRAL,  // 横ばい
    NEGATIVE  // 下落
}

// ユーザー情報
data class User(
    val uid: String,
    val displayName: String?,
    val email: String?,
)

// ホーム画面のウォッチリストタブで使われるデータクラス
data class WatchlistItem(
    val stock: Stock,
    val relatedFactors: List<Factor> // その銘柄に関連する直近のファクター
)

// ホーム画面のハッシュタグタブで使われるデータクラス
data class HashtagItem(
    val name: String, // 例: "#金融政策"
    val factorCount: Int,
    val relatedFactors: List<Factor> // そのハッシュタグに関連する直近のファクター
)`
```
---

## 4. アーキテクチャレイヤー

### 4.1. データ層 (Data Layer)

Firebase **および外部API**との通信を抽象化し、ドメイン層にクリーンなデータを提供する。

- **`AuthRepository`** (認証)
    - Firebase Authenticationの機能を抽象化する。
    - `fun observeAuthState(): Flow<User?>`: ユーザーの認証状態を監視する。
    - `suspend fun signInWithGoogle(idToken: String): Result<User>`: Googleでサインインする。
    - `suspend fun signOut(): Result<Unit>`: サインアウトする。
    - `fun getCurrentUser(): User?`: 現在のユーザー情報を取得する。
- **`FactorRepository`** (ファクター)
    - ファクターに関するFirestoreおよびCloud Storageの操作を担当する。
    - `fun getFactors(userId: String): Flow<List<Factor>>`: ユーザーの全ファクターをリアルタイムで取得。
    - `fun getFactorsByHashtag(userId: String, hashtag: String): Flow<List<Factor>>`: ハッシュタグでファクターを絞り込み取得。
    - `fun getFactorsByStock(userId: String, stockCode: String): Flow<List<Factor>>`: 銘柄コードでファクターを絞り込み取得。
    - `fun getFactorsByDateRange(userId: String, start: Timestamp, end: Timestamp): Flow<List<Factor>>`: 期間でファクターを取得（カレンダー用）。
    - `suspend fun addFactor(userId: String, factor: Factor, image: ByteArray?): Result<Unit>`: 新規ファクターと画像を保存。画像がある場合はStorageにアップロードし、URLをFirestoreに書き込む。
    - `suspend fun updateFactor(userId: String, factor: Factor): Result<Unit>`: ファクターを更新。
    - `suspend fun deleteFactor(userId: String, factorId: String): Result<Unit>`: ファクターを削除。
- **`UserRepository`** (ユーザーデータ)
    - ユーザーのプロフィールやウォッチリストなど、`factors`以外のユーザー関連データを扱う。
    - `fun getWatchlist(userId: String): Flow<List<Stock>>`: ウォッチリストに登録された銘柄一覧を取得。
    - `suspend fun addToWatchlist(userId: String, stock: Stock): Result<Unit>`: ウォッチリストに銘柄を追加。
- **`StockRepository` (新規追加)**
    - **EDINET APIとの通信を担当し、銘柄情報を検索・取得する。**
    - **`suspend fun searchStocks(query: String): Result<List<Stock>>`: クエリ文字列に基づき、EDINET APIに銘柄を検索し、結果をリストで返す。**

### 4.2. ドメイン層 (Domain Layer)

特定のビジネスロジック（ユースケース）をカプセル化する。

- **`CreateFactorUseCase`**: 新規ファクターを作成する。入力値のバリデーションを行い、`FactorRepository`を呼び出す。
- **`GetHomeFeedUseCase`**: ホーム画面の「メモ」タブに表示するファクターのリストを取得・加工する。
- **`GetWatchlistUseCase`**: ウォッチリストの銘柄と、それぞれに関連するファクターを取得し、`List<WatchlistItem>`形式に整形する。
- **`GetHashtagsUseCase`**: ユーザーが使用しているハッシュタグと関連ファクターを集計し、`List<HashtagItem>`形式に整形する。
- **`GetFactorsForCalendarUseCase`**: 指定された月のファクターを取得し、カレンダー表示に適した形式 (`Map<Date, List<Factor>>`) に変換する。
- **`SearchUseCase`**: 与えられたクエリに基づき、ファクター、ハッシュタグ、銘柄を横断的に検索するロジックを実装する。 **検索対象が銘柄の場合、`StockRepository`を呼び出す。**
- **`LogoutUseCase`**: `AuthRepository`を呼び出してサインアウト処理を実行する。

### 4.3. プレゼンテーション層 (Presentation Layer)

UIの状態管理と、ユーザーからのイベント処理を担当する。

- **`HomeViewModel`**
    - **UiState**: `HomeUiState`
    - **責務**: ホーム画面の状態管理。タブの切り替え、FABタップ、スワイプ更新などのイベントを処理する。
    - **依存**: `GetHomeFeedUseCase`, `GetWatchlistUseCase`, `GetHashtagsUseCase`
- **`SearchViewModel`**
    - **UiState**: `SearchUiState`
    - **責務**: 検索画面の状態管理。検索クエリとカテゴリの変更をハンドリングし、`SearchUseCase`を呼び出す。
    - **依存**: `SearchUseCase`
- **`CalendarViewModel`**
    - **UiState**: `CalendarUiState`
    - **責務**: カレンダー画面の状態管理。月の移動、日付選択イベントを処理し、`GetFactorsForCalendarUseCase`を呼び出す。
    - **依存**: `GetFactorsForCalendarUseCase`
- **`DetailViewModel`**
    - **UiState**: `DetailUiState`
    - **責務**: 銘柄詳細画面またはハッシュタグ詳細画面の状態管理。初期化時に渡された銘柄コードやハッシュタグ名に基づき、関連ファクターを取得する。
    - **依存**: `FactorRepository`
- **`PostModalViewModel`**
    - **UiState**: `PostModalUiState`
    - **責務**: 投稿・編集モーダルの状態管理。入力値（タイトル、本文、ハッシュタグ等）、ファクター種別、編集モード/新規モードの切り替えを管理し、「保存」タップ時に`CreateFactorUseCase`等を呼び出す。
    - **依存**: `CreateFactorUseCase`, `FactorRepository` (編集時)
- **`SettingsViewModel`**
    - **UiState**: `SettingsUiState`
    - **責務**: 設定画面の状態管理。ユーザー情報の表示や、ログアウトイベントの処理を行う。
    - **依存**: `AuthRepository`, `LogoutUseCase`

---

## 5. エラーハンドリング

1. **Repository層**: Firebaseとの通信で発生した例外（例: `PermissionDenied`, `Unavailable`）をキャッチし、ドメイン層には`Result<T>`でラップして返す。
2. **UseCase層**: Repositoryから受け取った`Result`をそのままViewModelに渡す。
3. **ViewModel層**: `Result.onFailure`をハンドリングし、`UiState`内の`errorMessage`フィールドを更新する。
4. **UI層**: `UiState`の`errorMessage`を監視し、nullでなければスナックバーやエラー画面 (`error-display.html`) を表示する。

---

## 6. 依存性の注入 (Koin)

Koinモジュールをレイヤーごとに分割し、依存関係を定義する。
```
Kotlin

`// shared/src/commonMain/kotlin/di/Koin.kt

// データ層モジュール
val dataModule = module {
    single<AuthRepository> { FirebaseAuthRepository() }
    single<FactorRepository> { FirebaseFactorRepository() }
    // ...
}

// ドメイン層モジュール
val domainModule = module {
    factory { CreateFactorUseCase(get()) }
    factory { GetHomeFeedUseCase(get()) }
    // ...
}

// プレゼンテーション層モジュール
val presentationModule = module {
    viewModel { HomeViewModel(get(), get(), get()) }
    viewModel { SearchViewModel(get()) }
    // ...
}`
```
---

## 7. 結論

この共有ロジック設計により、AndroidとiOSで同一のビジネスルールと振る舞いを保証する。クリーンアーキテクチャとリアクティブなデータフローを採用することで、テストが容易で、将来の機能拡張にも柔軟に対応できる、堅牢かつスケーラブルなアプリケーション基盤を構築する。