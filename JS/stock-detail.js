/**
 * 株メモ - 銘柄詳細ページ用スクリプト (stock-detail.js) - 改修版
 */
// stock-detail.js の上部にある DOMContentLoaded のリスナーを修正

document.addEventListener('DOMContentLoaded', async () => {
    await loadStockFactorCards();

    setupDetailModal();
    setupCardInteraction();
    setupConsensusPanel();
    setupInteractiveSentimentControls(); // ← この行を追加

    if (typeof setupMultiStepPostModal === 'function') {
        setupMultiStepPostModal();
    }
    if (typeof setupInfoModal === 'function') {
        setupInfoModal();
    }
});

// stock-detail.js 内の loadStockFactorCards 関数を置き換え
function loadStockFactorCards() { // async は不要に
    try {
        // HTMLからテンプレートを取得
        const template = document.getElementById('factor-card-template');
        if (!template) throw new Error('factor-card-template が見つかりません。');

        const factorCards = template.content.querySelectorAll('.factor-card');
        const listContainer = document.querySelector('.factor-list');
        if (!listContainer) return;

        listContainer.innerHTML = ''; // コンテナを一度空にする
        factorCards.forEach(card => {
            const clonedCard = card.cloneNode(true);
            listContainer.appendChild(clonedCard);
            // 動的に追加したカード内のセンチメントアイコンにもクリックイベントを設定
            if (typeof setupSentimentInteractions === 'function') {
                setupSentimentInteractions(clonedCard);
            }
        });
    } catch (error) {
        console.error("ファクターの読み込みに失敗:", error);
        const listContainer = document.querySelector('.factor-list');
        if (listContainer) {
            listContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #888;">関連ファクターの読み込みに失敗しました。</p>';
        }
    }
}

/**
 * 機能：センチメントアイコンにクリックイベントを設定
 * @param {HTMLElement} cardElement - 対象のカード要素
 */
function setupSentimentInteractions(cardElement) {
    const sentimentItems = cardElement.querySelectorAll('.sentiment-item');
    sentimentItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.stopPropagation();
            const group = item.closest('.sentiment-group');
            if (group) {
                group.querySelectorAll('.sentiment-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            }
        });
    });
}


// ▼▼▼ ここから下の関数群をまるごと置き換え ▼▼▼

/**
 * 機能：カードクリック〜詳細表示までの一連の動作を設定 (home.jsのロジックを流用)
 */
function setupCardInteraction() {
    const container = document.querySelector('.leftContainer');
    if (!container) return;

    const factorList = container.querySelector('.factor-list');
    const viewDetailsButton = container.querySelector('.view-details-button');

    if (!factorList || !viewDetailsButton) return;

    // カードリスト全体でクリックを監視（イベント委任）
    factorList.addEventListener('click', (event) => {
        const card = event.target.closest('.factor-card');

        // カード内、かつアクションボタン以外がクリックされた場合
        if (card && !event.target.closest('.sentiment-item, a, button')) {
            factorList.querySelectorAll('.factor-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            viewDetailsButton.style.display = 'flex'; // ボタンを表示
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
 * 機能：詳細モーダルの閉じるボタンなどを設定 (thread.jsから流用)
 */
function setupDetailModal() {
    const detailModal = document.getElementById('factorDetailModal');
    if (!detailModal) return;
    const closeButton = detailModal.querySelector('.close-button');

    const closeModal = () => detailModal.classList.remove('active');

    if (closeButton) closeButton.addEventListener('click', closeModal);
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeModal();
    });
}