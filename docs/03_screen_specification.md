## 1. 概要

本ドキュメントは、アプリケーション「株メモ」を構成する主要な画面およびUIコンポーネントの仕様を定義する。各画面が保持すべき状態（UiState）、ユーザー操作（Events）、そしてComposeによるコンポーネント設計の指針を示す。

---

## 2. ホーム画面 (`home.html`)

### 2.1. 概要

アプリケーション起動後のメイン画面。ユーザーが記録した「ウォッチリスト」「メモ」「ハッシュタグ」の情報をタブで切り替えて表示する。新しいメモを作成するための起点ともなる。

### 2.2. UI State

この画面を表示するためにViewModelがUI層に提供するデータ構造を定義する。
```
Kotlin

`data class HomeUiState(
    // 全体の状態
    val isLoading: Boolean = true,
    val errorMessage: String? = null,
    val selectedTab: HomeTab = HomeTab.MEMO,

    // 各タブのコンテンツ
    val memoFeed: List<Factor> = emptyList(), // **現在読み込まれているファクターのみ保持**
    val watchlistItems: List<WatchlistItem> = emptyList(), 
    val hashtagItems: List<HashtagItem> = emptyList(),

    // **ページネーションの状態**
    val isMemoFeedLoadingMore: Boolean = false,
    val canMemoFeedLoadMore: Boolean = true // **さらに読み込むデータがあるか**
)

enum class HomeTab {
    WATCHLIST,
    MEMO,
    HASHTAGS
}`
```
### 2.3. 画面の状態 (States)

| 状態 | 条件 | UI上の表現 |
| --- | --- | --- |
| **初期表示/ローディング中** | `isLoading = true` | ・画面中央にローディングインジケータを表示する。<br>・各タブのコンテンツエリアは空。 |
| **通常表示 (データあり)** | `isLoading = false` かつ `memoFeed` などが空でない | ・選択中タブのコンテンツ（メモカード一覧など）を表示する。 |
| **通常表示 (データなし)** | `isLoading = false` かつ `memoFeed` などが空 | ・コンテンツエリアに「最初のメモを追加しましょう」などの案内メッセージを表示する (`empty-state.html`)。 |
| **追加読み込み中** | `isMemoFeedLoadingMore = true` | ・メモ一覧の末尾にローディングインジケータを表示する。 |
| **エラー表示** | `errorMessage` に文字列が設定されている | ・画面下部などにエラーメッセージ（例: "データの読み込みに失敗しました"）を一時的に表示する (`error-display.html`)。 |

### 2.4. ユーザーイベント (Events)

| イベント | トリガー | ViewModelへの通知 | 画面遷移/UI変化 |
| --- | --- | --- | --- |
| **タブをタップ** | ユーザーが上部のタブをタップ | `onTabSelected(tab: HomeTab)` | 画面内のコンテンツが切り替わる。 |
| **メモカードをタップ** | 「メモ」タブで任意のカードをタップ | `onFactorClicked(factorId: String)` | 「詳細を見る」ボタンが表示される。 |
| **詳細を見るボタンをタップ** | 表示された「詳細を見る」ボタンをタップ | `onShowFactorDetailsClicked()` | 詳細モーダルを開く。 |
| **FAB(+)ボタンをタップ** | 右下の `+` ボタンをタップ | `onAddFactorClicked()` | 新規作成モーダルを開く。 |
| **画面を下にスワイプ** | コンテンツ一覧を下にスワイプ | `onRefresh()` | データの再読み込み処理を実行。 |
| **リスト末尾までスクロール** | ユーザーがメモ一覧の末尾に到達 | `onMemoFeedScrolledToEnd()` | 次のページのデータを非同期で読み込み、リストに追加する。 |

### 2.5. コンポーネント設計 (Compose)

- `HomeScreen` (画面全体のルート)
    - `HomeTabs` (「ウォッチリスト」「メモ」「ハッシュタグ」のタブコンポーネント)
    - `MemoFeedList` (メモ一覧を表示するコンポーネント)
        - `FactorCard` ( **※共通コンポーネント** )
    - `WatchlistContent` (ウォッチリストタブのコンテンツ)
    - `HashtagContent` (ハッシュタグタブのコンテンツ)
    - `HomeFab` (右下の `+` ボタン)

---

## 3. 検索画面 (`search.html`)

### 3.1. 概要

「ファクター」「ハッシュタグ」「銘柄」のカテゴリで情報を横断的に検索する画面。

### 3.2. UI State
```
Kotlin

`data class SearchUiState(
    val isLoading: Boolean = false,
    val searchQuery: String = "",
    val selectedCategory: SearchCategory = SearchCategory.FACTOR,
    val searchResults: List<SearchResultItem> = emptyList(),

    // **ページネーションの状態**
    val isLoadingMore: Boolean = false,
    val canLoadMore: Boolean = true
)

enum class SearchCategory {
    FACTOR,
    HASHTAG,
    STOCK
}

sealed interface SearchResultItem {
    data class FactorResult(val factor: Factor) : SearchResultItem
    data class HashtagResult(val hashtag: HashtagItem) : SearchResultItem
    data class StockResult(val stock: Stock) : SearchResultItem
}`
```
### 3.3. ユーザーイベント

| イベント | トリガー | ViewModelへの通知 | UI変化 |
| --- | --- | --- | --- |
| **検索クエリを入力** | ユーザーが検索ボックスに文字を入力 | `onQueryChanged(query: String)` | 検索結果がリアルタイムに更新される。**銘柄カテゴリ選択時はEDINET APIへの通信が発生する。** |
| **検索カテゴリをタップ** | ユーザーが上部のカテゴリをタップ | `onCategorySelected(category: SearchCategory)` | 選択されたカテゴリで検索が実行され、結果が更新される。 |
| **検索結果をタップ** | ユーザーが検索結果の項目をタップ | `onResultItemClicked(item: SearchResultItem)` | 対応する詳細画面 (`thread.html` or `stock-detail.html`) に遷移する。 |
| **検索結果を末尾までスクロール** | ユーザーが検索結果一覧の末尾に到達 | `onSearchResultsScrolledToEnd()` | 次のページの検索結果を読み込み、リストに追加する。 |

### 3.4. コンポーネント設計 (Compose)

- `SearchScreen`
    - `SearchCategorySelector` (検索カテゴリの選択タブ)
    - `SearchTextField` (検索キーワード入力欄)
    - `SearchResultsList` (検索結果一覧)
        - `FactorResultItem`, `HashtagResultItem`, `StockResultItem` (各結果の種類に応じたコンポーザブル。 **`StockResultItem`はEDINET APIのレスポンス(`Stock`モデル)を表示する** )

---

## 4. カレンダー画面 (`calendar.html`)

### 4.1. 概要

作成したファクターを日付ベースで振り返ることができるカレンダー画面。

### 4.2. UI State
```
Kotlin

`data class CalendarUiState(
    val isLoading: Boolean = false,
    val currentMonth: YearMonth, // 表示中の年月
    val selectedDate: LocalDate, // 選択中の日付
    val memosForSelectedDate: List<Factor> = emptyList(),
    val datesWithMemos: Set<LocalDate> = emptySet() // メモが存在する日付のセット
)`
```
### 4.3. ユーザーイベント

| イベント | トリガー | ViewModelへの通知 | UI変化 |
| --- | --- | --- | --- |
| **月移動ボタンをタップ** | ユーザーが `<` `>` ボタンをタップ | `onPreviousMonthClicked()` / `onNextMonthClicked()` | カレンダーの表示月が更新される。 |
| **日付をタップ** | ユーザーがカレンダーの日付セルをタップ | `onDateSelected(date: LocalDate)` | タップした日付が選択状態になり、その日のメモが下部に表示される。 |

### 4.4. コンポーネント設計 (Compose)

- `CalendarScreen`
    - `CalendarHeader` (年月表示と月移動ボタン)
    - `CalendarGrid` (カレンダー本体)
        - `CalendarDayCell` (各日付セル、メモの有無を示すドット付き)
    - `MemosForDayList` (選択された日のメモ一覧)
        - `FactorCard` ( **※共通コンポーネント** )

---

## 5. 詳細画面 (`stock-detail.html` / `thread.html`)

### 5.1. 概要

特定の銘柄やハッシュタグに関連するファクターを時系列で一覧表示する画面。

### 5.2. UI State
```
Kotlin

`data class DetailUiState(
    val isLoading: Boolean = true,
    val headerTitle: String = "",       
    val headerSubtitle: String = "",    
    val factors: List<Factor> = emptyList(),

    // **ページネーションの状態**
    val isLoadingMore: Boolean = false,
    val canLoadMore: Boolean = true
)`
```
### 5.3. ユーザーイベント

| イベント | トリガー | ViewModelへの通知 | 画面遷移/UI変化 |
| --- | --- | --- | --- |
| **戻るボタンをタップ** | ユーザーが画面左上の `<` ボタンをタップ | `onBackClicked()` | 前の画面（ホーム画面など）に戻る。 |
| **ファクターカードをタップ** | ユーザーがリスト内のカードをタップ | `onFactorClicked(factorId: String)` | 詳細モーダルを開く。 |
| **FAB(+)ボタンをタップ** | 右下の `+` ボタンをタップ | `onAddFactorForThisContextClicked()` | 新規作成モーダルを開く（対象銘柄やハッシュタグが自動で入力された状態）。 |
| **ファクター一覧を末尾までスクロール** | ユーザーがファクター一覧の末尾に到達 | `onFactorListScrolledToEnd()` | 次のページのファクターを読み込み、リストに追加する。 |

### 5.4. コンポーネント設計 (Compose)

- `DetailScreen`
    - `DetailHeader` (タイトル、サブタイトル、戻るボタン)
    - `FactorList` (ファクター一覧)
        - `FactorCard` ( **※共通コンポーネント** )
    - `DetailFab`

---

## 6. 設定画面 (`settings.html`)

### 6.1. 概要

アカウント情報の編集や各種設定、ログアウトなどを行う画面。

### 6.2. UI State

多くは静的なナビゲーション項目のため、`UiState`はユーザー情報など最小限に留まる。

Kotlin

`data class SettingsUiState(
    val user: User? // ログイン中のユーザー情報
)`

### 6.3. ユーザーイベント

| イベント | トリガー | ViewModelへの通知 | 画面遷移 |
| --- | --- | --- | --- |
| **項目をタップ** | 各設定項目（プロフィール編集など）をタップ | `onSettingsItemClicked(item: SettingsItem)` | 対応する画面（プロフィール編集画面など）に遷移する。 |
| **ログアウトをタップ** | 「ログアウト」をタップ | `onLogoutClicked()` | 確認ダイアログを表示後、認証を解除してログイン画面に遷移する。 |

### 6.4. コンポーネント設計 (Compose)

- `SettingsScreen`
    - `SettingsCategory` (「アカウント」「通知」などのカテゴリヘッダー)
    - `SettingsItem` (各設定項目)

---

## 7. 投稿・編集モーダル (`modal-post.html`)

### 7.1. 概要

すべてのファクターを新規作成・編集するためのUI。モーダルダイアログとして実装される。

### 7.2. UI State
```
Kotlin

`data class PostModalUiState(
    val mode: PostModalMode = PostModalMode.CREATE, // 新規作成か編集か
    val currentStep: PostModalStep = PostModalStep.TYPE_SELECTION, // 2段階のどちらか
    
    // Step 1
    val selectedType: FactorType = FactorType.TWEET,
    
    // Step 2
    val title: String = "",
    val content: String = "",
    val hashtags: List<String> = emptyList(),
    val targetStock: Stock? = null,
    val imageUri: String? = null, // 添付画像のURI
    val period: DateRange? = null,
    
    // 状態
    val isSaving: Boolean = false,
    val validationError: String? = null
)

enum class PostModalMode { CREATE, EDIT }
enum class PostModalStep { TYPE_SELECTION, CONTENT_INPUT }`
```
### 7.3. ユーザーイベント

| イベント | トリガー | ViewModelへの通知 | UI変化 |
| --- | --- | --- | --- |
| **メモの種類を選択** | Step 1でラジオボタンをタップ | `onTypeSelected(type: FactorType)` | `selectedType`が更新される。個別銘柄メモ選択時はStep 2で銘柄選択欄が表示される。 |
| **「次へ」をタップ** | Step 1で「次へ」ボタンをタップ | `onNextClicked()` | `currentStep`が`CONTENT_INPUT`に更新され、Step 2の画面が表示される。 |
| **「戻る」をタップ** | Step 2で `<` ボタンをタップ | `onBackClicked()` | `currentStep`が`TYPE_SELECTION`に更新され、Step 1の画面に戻る。 |
| **「保存」/「更新」をタップ** | Step 2でボタンをタップ | `onSaveClicked()` | バリデーション後、`isSaving`がtrueになり、リポジトリへの保存処理が実行される。成功後モーダルを閉じる。 |