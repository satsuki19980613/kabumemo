/**
 * 株メモ - ホーム画面用スクリプト (home.js)
 */
// home.js

// home.js の上部にあるこの部分を編集

// home.js の上部にある DOMContentLoaded のリスナーを修正

document.addEventListener('DOMContentLoaded', () => {
    // 1. 共通モーダルやタブ機能などを初期化
    setupHomeTabs();
    setupHashtagCardNavigation();
    setupConsensusAddStockButton();
    setupDetailModal();
    setupMemoCardInteraction();
    setupInteractiveSentimentControls(); // ← この行を追加

    // 2. 各タブにfactor-card.htmlの内容を読み込む
    loadMemoCards();
    loadWatchlistCards();
    loadHashtagCards();
    setupConsensusPanel();
});


async function loadMemoCards() {
    try {
        // --- ① メモ一覧と「データなし」画面の要素を取得します ---
        const memoListContainer = document.querySelector('#memo .factor-list');
        const emptyStateContainer = document.querySelector('#memo .empty-state-container');

        if (!memoListContainer || !emptyStateContainer) {
            console.error('必要な要素が見つかりません。');
            return;
        }

        // --- ② ここで本来はDBからデータを取得します ---
        // 今回はテストのため、意図的に空の配列（データ0件）とします
        const memosFromDB = []; // ← データが0件の状態をシミュレート

        // --- ③ 取得したデータ件数に応じて表示を切り替えます ---
        if (memosFromDB.length > 0) {
            // データが1件以上ある場合
            memoListContainer.style.display = 'block';
            emptyStateContainer.style.display = 'none';

            // ここに、memosFromDBの内容を元にカードを生成して
            // memoListContainer に追加(appendChild)する処理が入ります。

        } else {
            // データが0件の場合
            memoListContainer.style.display = 'none';
            emptyStateContainer.style.display = 'flex'; // 「データなし」画面を表示
        }

    } catch (error) {
        console.error('メモカードの読み込み中にエラーが発生しました:', error);
        // エラー発生時はリストを非表示にするなどの処理
        const memoListContainer = document.querySelector('#memo .factor-list');
        if (memoListContainer) {
            memoListContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #888;">メモの読み込みに失敗しました。</p>';
        }
    }
}

/**
 * 機能：factor-card.htmlからファクターカードを読み込み、「ウォッチリスト」タブに簡易表示する
 */
async function loadWatchlistCards() {
    // (既存のfetch処理などはそのまま)
    try {
        // ...
        // factor-card.htmlからカードを読み込む処理
        // ...

        const listContainer = document.querySelector('#watchlist .watchlist-list');
        const emptyContainer = document.querySelector('#watchlist .empty-state-container');

        // ★★★ テスト用にデータ0件の状態を作ります ★★★
        listContainer.innerHTML = ''; // ← この行でリストを空にする

        if (listContainer.children.length > 0) {
            listContainer.style.display = 'block';
            emptyContainer.style.display = 'none';
        } else {
            listContainer.style.display = 'none';
            emptyContainer.style.display = 'flex';
        }
    } catch (error) {
        console.error('ウォッチリストのカード読み込み中にエラーが発生しました:', error);
    }
}


// 「ハッシュタグ」のカード読み込み関数を修正
async function loadHashtagCards() {
    // (既存のfetch処理などはそのまま)
    try {
        // ...
        // factor-card.htmlからカードを読み込む処理
        // ...

        const listContainer = document.querySelector('#hashtags .hashtag-list-container');
        const emptyContainer = document.querySelector('#hashtags .empty-state-container');

        // ★★★ テスト用にデータ0件の状態を作ります ★★★
        listContainer.innerHTML = ''; // ← この行でリストを空にする

        if (listContainer.children.length > 0) {
            listContainer.style.display = 'block';
            emptyContainer.style.display = 'none';
        } else {
            listContainer.style.display = 'none';
            emptyContainer.style.display = 'flex';
        }
    } catch (error) {
        console.error('ハッシュタグカードの読み込み中にエラーが発生しました:', error);
    }
}

/**
 * 機能：ホーム画面のタブ切り替え
 */
function setupHomeTabs() {
    const tabContainer = document.querySelector('.home-tab-container');
    if (!tabContainer) return;

    const tabs = tabContainer.querySelectorAll('.home-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabContainer.addEventListener('click', (event) => {
        const targetTab = event.target.closest('.home-tab');
        if (!targetTab) return;

        const tabId = targetTab.dataset.tab;
        const targetContent = document.getElementById(tabId);

        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        targetTab.classList.add('active');
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
}

/**
 * 機能：ハッシュタグタブ内のカードをクリックしたらスレッド画面に遷移する
 */
function setupHashtagCardNavigation() {
    const hashtagContainer = document.querySelector('#hashtags');
    if (!hashtagContainer) return;

    // イベントデリゲーションを利用して、コンテナ全体のクリックを監視
    hashtagContainer.addEventListener('click', function (event) {
        // クリックされた要素から一番近い .watchlist-card を探す
        const card = event.target.closest('.watchlist-card');

        // カードが存在し、かつ data-href 属性を持っている場合のみ遷移
        if (card && card.dataset.href) {
            window.location.href = card.dataset.href;
        }
    });
}


/**
 * 機能：詳細モーダルを開く (thread.jsから流用)
 * @param {HTMLElement} cardElement - クリックされたカード要素
 */
function openDetailModal(cardElement) {
    const detailModal = document.getElementById('factorDetailModal');
    const detailBody = document.getElementById('detailModalBody');
    if (!detailModal || !detailBody) return;

    const header = cardElement.querySelector('.factor-card-header').cloneNode(true);
    const title = cardElement.querySelector('.factor-title')?.cloneNode(true);
    const content = cardElement.querySelector('.factor-content').cloneNode(true);
    const actions = cardElement.querySelector('.factor-sentiment-actions')?.cloneNode(true);

    const fullContent = cardElement.querySelector('.factor-content').dataset.fullContent;
    if (fullContent) {
        content.textContent = fullContent;
    }

    detailBody.innerHTML = '';
    detailBody.appendChild(header);
    if (title) detailBody.appendChild(title);
    detailBody.appendChild(content);
    if (actions) detailBody.appendChild(actions);

    // --- ▼▼▼ ここから追加 ▼▼▼ ---

    // 編集ボタンを取得して、クリックイベントを設定
    const editButton = detailModal.querySelector('#edit-factor-button');
    if (editButton) {
        editButton.onclick = () => {
            // 詳細モーダルを閉じる
            detailModal.classList.remove('active');

            // 編集対象のカード要素を引数に渡して、投稿モーダルを「編集モード」で開く
            openPostModal(cardElement);
        };
    }

    // --- ▲▲▲ 追加はここまで ▲▲▲ ---

    detailModal.classList.add('active');
}

/**
 * 機能：詳細モーダルの閉じるボタンなどを設定 (thread.jsから移植)
 */
function setupDetailModal() {
    const detailModal = document.getElementById('factorDetailModal');
    if (!detailModal) return;
    const closeButton = detailModal.querySelector('.close-button');

    const closeModal = () => detailModal.classList.remove('active');

    if (closeButton) closeButton.addEventListener('click', closeModal);
    // モーダルの外側をクリックしても閉じるように設定
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeModal();
    });
}

/**
 * 機能：メモタブ内のカードクリック〜詳細表示までの一連の動作を設定
 */
function setupMemoCardInteraction() {
    const memoTab = document.querySelector('#memo');
    if (!memoTab) return;

    const factorList = memoTab.querySelector('.factor-list');
    const viewDetailsButton = memoTab.querySelector('.view-details-button');

    if (!factorList || !viewDetailsButton) return;

    // カードリスト全体でクリックを監視（イベント委任）
    factorList.addEventListener('click', (event) => {
        // クリックされたのがカード（またはその中身）かを確認
        const card = event.target.closest('.factor-card');

        // カード内、かつアクションボタン以外がクリックされた場合
        if (card && !event.target.closest('.sentiment-item, a, button')) {
            // すべてのカードから選択状態(.active)を解除
            factorList.querySelectorAll('.factor-card').forEach(c => c.classList.remove('active'));
            // クリックされたカードを選択状態にする
            card.classList.add('active');
            // 「詳細を見る」ボタンを表示
            viewDetailsButton.style.display = 'flex';
        }
    });

    // 「詳細を見る」ボタンがクリックされた時の動作
    viewDetailsButton.addEventListener('click', () => {
        const activeCard = factorList.querySelector('.factor-card.active');
        if (activeCard) {
            openDetailModal(activeCard); // 詳細モーダルを開く
        }
    });
}