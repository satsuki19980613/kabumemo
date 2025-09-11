/**
 * 株メモ - スレッド画面用スクリプト (thread.js)
 */

// thread.js の上部にある DOMContentLoaded のリスナーを修正

document.addEventListener('DOMContentLoaded', async () => {
    // 必要な関数を呼び出す
    await loadFactorCards();
    setupDetailModal();
    setupConsensusAddStockButton();
    setupConsensusPanel(); 
    setupInteractiveSentimentControls(); // ← この行を追加

    // 共通モーダル系の初期化
    if (typeof setupMultiStepPostModal === 'function') {
        setupMultiStepPostModal();
    }
    if (typeof setupInfoModal === 'function') {
        setupInfoModal();
    }
});

/**
 * ★★★ 新しく追加した関数 ★★★
 * 機能：factor-card.htmlからファクターカードを読み込み、リストに表示する
 */
async function loadFactorCards() {
    try {
        const response = await fetch('../HTML/factor-card.html');
        if (!response.ok) throw new Error('factor-card.htmlの読み込みに失敗しました。');
        const templateText = await response.text();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateText;

        const factorCards = tempDiv.querySelectorAll('.factor-card');
        const listContainer = document.querySelector('.factor-list');
        if (!listContainer) return;

        listContainer.innerHTML = ''; // コンテナを一度空にする
        factorCards.forEach(card => {
            listContainer.appendChild(card);
            // 動的に追加したカード内のセンチメントアイコンにもクリックイベントを設定
            setupSentimentInteractions(card);
        });
    } catch (error) {
        console.error("ファクターの読み込みに失敗:", error);
        const listContainer = document.querySelector('.factor-list');
        if (listContainer) {
            listContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #888;">ファクターの読み込みに失敗しました。</p>';
        }
    }
}

/**
 * ★★★ home.jsから移植した関数 ★★★
 * 機能：センチメントアイコンにクリックイベントを設定
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


/**
 * 機能：銘柄検索・紐付けモーダルの制御
 */
function setupLinkStockModal() {
    const linkStockModal = document.getElementById('linkStockModal');
    if (!linkStockModal) return;

    const addStockButtons = document.querySelectorAll('.add-stock-button');
    const closeButton = linkStockModal.querySelector('.close-button');
    const backButton = linkStockModal.querySelector('.back-to-search-button');
    const modalTitle = linkStockModal.querySelector('#linkStockModalTitle');

    const step1 = linkStockModal.querySelector('#stock-search-step1');
    const step2 = linkStockModal.querySelector('#stock-sentiment-step2');

    const searchResults = step1.querySelector('.stock-search-results');
    const selectedStockDisplay = step2.querySelector('.selected-stock-display .item-title');

    let currentSentimentSection = '';

    const resetModal = () => {
        step2.style.display = 'none';
        backButton.style.display = 'none';
        step1.style.display = 'block';
        modalTitle.textContent = '銘柄を検索';
    };

    const openModal = (sectionType) => {
        currentSentimentSection = sectionType;
        resetModal();
        linkStockModal.classList.add('active');
    };

    const closeModal = () => {
        linkStockModal.classList.remove('active');
    };

    addStockButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const sectionType = button.dataset.section;
            openModal(sectionType);
        });
    });

    closeButton.addEventListener('click', closeModal);
    linkStockModal.addEventListener('click', (e) => {
        if (e.target === linkStockModal) closeModal();
    });

    backButton.addEventListener('click', resetModal);

    searchResults.addEventListener('click', (e) => {
        const stockItem = e.target.closest('.result-item.stock-item');
        if (!stockItem) return;

        const stockName = stockItem.dataset.stockName;
        const stockCode = stockItem.dataset.stockCode;

        selectedStockDisplay.textContent = `${stockName} (${stockCode})`;

        step1.style.display = 'none';
        step2.style.display = 'block';
        backButton.style.display = 'block';
        modalTitle.textContent = 'センチメントを選択';
    });

    step2.querySelector('.sentiment-selection-buttons').addEventListener('click', (e) => {
        const sentimentButton = e.target.closest('.sentiment-btn');
        if (!sentimentButton) return;

        const selectedSentiment = sentimentButton.classList.contains('positive') ? 'ポジティブ'
            : sentimentButton.classList.contains('neutral') ? 'ニュートラル'
                : 'ネガティブ';

        console.log(`選択された銘柄: ${selectedStockDisplay.textContent}`);
        console.log(`選択されたセクション: ${currentSentimentSection}`);
        console.log(`選択されたセンチメント: ${selectedSentiment}`);
        console.log('ここで銘柄を紐付ける処理を実行します。');

        closeModal();
    });
}

/**
 * 機能：詳細モーダルの制御
 */
function openDetailModal(cardElement) {
    const detailModal = document.getElementById('factorDetailModal');
    const detailBody = document.getElementById('detailModalBody');
    if (!detailModal || !detailBody) return;
    const header = cardElement.querySelector('.factor-card-header').cloneNode(true);
    const title = cardElement.querySelector('.factor-title').cloneNode(true);
    const content = cardElement.querySelector('.factor-content').cloneNode(true);
    const actions = cardElement.querySelector('.factor-sentiment-actions')?.cloneNode(true);
    content.textContent = cardElement.querySelector('.factor-content').dataset.fullContent || content.textContent;
    detailBody.innerHTML = '';
    detailBody.appendChild(header);
    detailBody.appendChild(title);
    detailBody.appendChild(content);
    if (actions) {
        detailBody.appendChild(actions);
    }
    detailModal.classList.add('active');
}
function setupDetailModal() {
    const detailModal = document.getElementById('factorDetailModal');
    if (!detailModal) return;
    const closeButton = detailModal.querySelector('.close-button');
    const closeModal = () => detailModal.classList.remove('active');
    closeButton.addEventListener('click', closeModal);
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeModal();
    });
}

/**
 * 機能：カードクリックの制御
 */


/**
 * 機能：タイトルアニメーションの制御
 */
function setupFactorTitleAnimations() {
    const factorTitles = document.querySelectorAll('.factor-title');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.isIntersecting ? startScrollAnimation(entry.target) : stopScrollAnimation(entry.target);
        });
    }, { threshold: 0.1 });
    factorTitles.forEach(title => observer.observe(title));
}
function startScrollAnimation(element) {
    if (element.dataset.isAnimating === 'true' || element.scrollWidth <= element.clientWidth) return;
    element.dataset.isAnimating = 'true';
    const originalText = element.innerText;
    element.innerHTML = `<span>${originalText}</span>`;
    const span = element.querySelector('span');
    const animate = () => {
        span.style.transition = 'none';
        span.style.transform = 'translateX(0)';
        const waitTimeout = setTimeout(() => {
            const scrollDistance = span.scrollWidth - element.clientWidth;
            const duration = scrollDistance / 50;
            span.style.transition = `transform ${duration}s linear`;
            span.style.transform = `translateX(-${scrollDistance}px)`;
            const loopTimeout = setTimeout(animate, (duration * 1000) + 2000);
            element.dataset.loopTimeoutId = loopTimeout;
        }, 2000);
        element.dataset.waitTimeoutId = waitTimeout;
    };
    animate();
}
function stopScrollAnimation(element) {
    if (element.dataset.isAnimating === 'true') {
        clearTimeout(parseInt(element.dataset.waitTimeoutId));
        clearTimeout(parseInt(element.dataset.loopTimeoutId));
        element.dataset.isAnimating = 'false';
        const span = element.querySelector('span');
        if (span) element.innerHTML = span.innerText;
    }
}


/**
 * 機能：「⊕」ボタンが押されたら、銘柄検索モーダルを開く
 */
function setupAddStockButton() {
    const addStockButtons = document.querySelectorAll('.add-stock-button');
    const stockSearchModal = document.getElementById('stockSearchModal');
    if (!addStockButtons || !stockSearchModal) {
        console.log('ボタンまたはモーダルが見つかりません');
        return;
    }
    addStockButtons.forEach(button => {
        button.addEventListener('click', () => {
            stockSearchModal.classList.add('active');
        });
    });
    const closeButton = stockSearchModal.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            stockSearchModal.classList.remove('active');
        });
    }
}

// 共通スクリプトに含まれる関数（common.jsから読み込まれる想定）
// setupMultiStepPostModal();
// setupInfoModal();