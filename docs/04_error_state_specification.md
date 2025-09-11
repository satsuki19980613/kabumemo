## **1. 概要**

アプリケーション全体で発生するエラー状態の表示方法と挙動を定義する。ユーザーを適切に導き、問題を解決する手助けをすることを目的とする。

## **2. 参照モックアップ**

- `error-display.html`
- `empty-state.html`

## **3. UI State**

エラー状態を管理するためのデータ構造を定義する。
```
Kotlin

`data class ErrorUiState(
    val hasError: Boolean = false,
    val errorType: ErrorType? = null,
    val title: String? = null,
    val message: String? = null,
    val isRetryable: Boolean = false // 「リトライ」ボタンを表示するか
)

enum class ErrorType {
    NETWORK,          // ネットワーク接続不可
    SERVER,           // サーバーエラー (5xx)
    EXTERNAL_API,     // **外部APIのエラー**
    NOT_FOUND,        // データが見つからない (404)
    AUTHENTICATION    // 認証エラー
}`
```
## **4. エラー種別ごとの状態定義**

| 状態 | 条件 | UI上の表現 |
| --- | --- | --- |
| **ネットワークエラー** | 通信時にデバイスがオフライン | `error-display.html` に基づく全画面表示。<br>・Icon: `wifi_off`<br>・Title: "ネットワークに接続できません"<br>・Message: "お使いのデバイスが..."<br>・Button: リトライ表示 (`isRetryable = true`) |
| **サーバーエラー** | APIが500系エラーを返却 | 全画面表示。<br>・Icon: `cloud_off`<br>・Title: "サーバーで問題が発生しました"<br>・Message: "時間をおいて再度お試しください。..."<br>・Button: リトライ表示 (`isRetryable = true`) |
| **外部APIエラー** | **EDINET APIがエラーを返却、またはタイムアウトした場合** | **検索結果エリアなど、コンポーネント内にエラー表示。**<br>・Icon: `error_outline`<br>・Title: "情報の取得に失敗しました"<br>・Message: "時間をおいて再度お試しください。"<br>・Button: リトライ表示 (`isRetryable = true`) |
| **データなし** | 該当するファクターが存在しない | `empty-state.html`に基づく各画面のリスト領域に表示。<br>・Icon: `search_off`<br>・Title: "ファクターが見つかりません"<br>・Message: "条件を変えて再度お試しください。"<br>・Button: なし (`isRetryable = false`) |
| **認証エラー** | ログインセッション切れ | 全画面表示またはダイアログ表示。<br>・Icon: `lock`<br>・Title: "再ログインが必要です"<br>・Message: "セッションがタイムアウトしました。..."<br>・Button: 「ログイン画面へ」を表示 |

## **5. ユーザーイベント**

| イベント | トリガー | ViewModelへの通知 | 画面遷移 |
| --- | --- | --- | --- |
| **リトライボタンをタップ** | ユーザーが「リトライ」ボタンをタップ | `onErrorRetry()` | なし（直前のデータ取得処理を再実行） |
| **ログインボタンをタップ** | ユーザーが「ログイン画面へ」をタップ |  |  |