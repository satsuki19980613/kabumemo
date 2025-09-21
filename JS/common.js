/**
 * 共通スクリプト (common.js) - 2025/08/30 修正版
 */

// ページの読み込みが完了したら、基本的なイベントリスナーを設定
document.addEventListener('DOMContentLoaded', () => {
    setupFabInteraction();
    setupConsensusPanel();
    // ▼▼▼ 不足していた初期化処理を追加 ▼▼▼
    setupConsensusAddStockButton();
    setupInteractiveSentimentControls();
});

// --- グローバル変数 ---
let isModalsLoaded = false; // モーダルが一度読み込まれたかを管理するフラグ

/**
 * FABボタン（+ボタン）のクリックイベントを設定
 */
function setupFabInteraction() {
    const fabButton = document.querySelector('.fab-button');
    if (fabButton) {
        fabButton.addEventListener('click', () => {
            openPostModal(); // 新規モードでモーダルを開く
        });
    }
}

/**
 * 新規投稿／編集モーダルを開く関数
 * @param {HTMLElement} [cardElement=null] - 編集対象カード。nullの場合は新規モード。
 */
async function openPostModal(cardElement = null) {
    if (!isModalsLoaded) {
        await loadModals();
    }
    const postModal = document.getElementById('postModal');
    if (!postModal) return;

    const titleElement = postModal.querySelector('#post-modal-title');
    const step1 = postModal.querySelector('#modal-step1');
    const step2 = postModal.querySelector('#modal-step2');
    const footer1 = postModal.querySelector('#footer-step1');
    const footer2 = postModal.querySelector('#footer-step2');
    const saveButton = postModal.querySelector('#save-button');
    const nextButton = postModal.querySelector('#next-button');
    const backButton = postModal.querySelector('.back-to-step1-button');
    const editorTitle = postModal.querySelector('#editorTitle');
    const editorContent = postModal.querySelector('#editorContent');

    if (cardElement) {
        // --- 編集モード ---
        titleElement.textContent = 'メモを編集';
        step1.style.display = 'none';
        footer1.style.display = 'none';
        step2.style.display = 'block';
        footer2.style.display = 'flex';
        backButton.style.display = 'none';
        saveButton.textContent = '更新';

        const cardTitle = cardElement.querySelector('.factor-title')?.textContent || '';
        const cardFullContent = cardElement.querySelector('.factor-content').dataset.fullContent || cardElement.querySelector('.factor-content').textContent;
        
        editorTitle.textContent = cardTitle;
        editorContent.textContent = cardFullContent;
        
        saveButton.onclick = () => {
            handleSave(editorTitle.textContent, editorContent.textContent);
            postModal.classList.remove('active');
        };

    } else {
        // --- 新規投稿モード ---
        titleElement.textContent = '新規メモ';
        step1.style.display = 'block';
        footer1.style.display = 'flex';
        step2.style.display = 'none';
        footer2.style.display = 'none';
        backButton.style.display = 'none';
        saveButton.textContent = '保存';
        
        editorTitle.textContent = '';
        editorContent.textContent = '';

        nextButton.onclick = () => {
            step1.style.display = 'none';
            footer1.style.display = 'none';
            step2.style.display = 'block';
            footer2.style.display = 'flex';
            backButton.style.display = 'block';
            editorTitle.focus();
        };

        saveButton.onclick = () => {
            handleSave(editorTitle.textContent, editorContent.textContent);
            postModal.classList.remove('active');
        };
    }

    postModal.classList.add('active');
    setTimeout(() => editorTitle.focus(), 100);
}

/**
 * タイトルと内容を受け取り、保存処理を行う関数
 */
function handleSave(title, content) {
    const finalTitle = title.trim();
    const finalContent = content.trim();
    
    console.log("保存されるタイトル:", finalTitle);
    console.log("保存される内容:", finalContent);
    alert(`保存します：\nタイトル: ${finalTitle}\n内容: ${finalContent.substring(0, 30)}...`);
}

/**
 * modal-post.htmlを非同期で読み込み、各種イベントリスナーを初期設定する
 */
async function loadModals() {
    try {
        const response = await fetch('../HTML/modal-post.html');
        if (!response.ok) throw new Error('モーダルファイルの読み込みに失敗');
        const modalHtml = await response.text();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        setupModalInternals();
        isModalsLoaded = true;
    } catch (error) {
        console.error('モーダルの読み込みエラー:', error);
        alert('投稿機能の読み込みに失敗しました。');
    }
}

/**
 * 初回モーダル読み込み時に、内部要素のイベントをまとめて設定
 * ▼▼▼ 重複を解消し、正しい定義に統一 ▼▼▼
 */
function setupModalInternals() {
    setupMultiStepPostModalLogic();
    setupInfoModalLogic();
    setupStockSearchModalLogic();
    setupPostEditorLogic();
    setupPostTypeSelectionLogic(); // 投稿タイプの選択ロジックを追加
}

/**
 * 多段階モーダルの「戻る」「閉じる」などの基本動作を設定
 */
function setupMultiStepPostModalLogic() {
    const postModal = document.getElementById('postModal');
    if (!postModal) return;

    const closeButton = postModal.querySelector('.close-button');
    const backButton = postModal.querySelector('.back-to-step1-button');
    const step1 = postModal.querySelector('#modal-step1');
    const step2 = postModal.querySelector('#modal-step2');
    const footer1 = postModal.querySelector('#footer-step1');
    const footer2 = postModal.querySelector('#footer-step2');
    
    const resetToStep1 = () => {
        step2.style.display = 'none';
        footer2.style.display = 'none';
        backButton.style.display = 'none';
        step1.style.display = 'block';
        footer1.style.display = 'flex';
    };

    const closeModal = () => {
        postModal.classList.remove('active');
        setTimeout(resetToStep1, 300);
    };

    closeButton.addEventListener('click', closeModal);
    postModal.addEventListener('click', (e) => { if (e.target === postModal) closeModal(); });
    backButton.addEventListener('click', resetToStep1);
}

/**
 * 投稿エディタの入力ロジックを設定する関数 (contenteditable div用)
 */
function setupPostEditorLogic() {
    const postModal = document.getElementById('postModal');
    if (!postModal) return;
    const editorTitle = postModal.querySelector('#editorTitle');
    const editorContent = postModal.querySelector('#editorContent');

    if (editorTitle && editorContent) {
        editorTitle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                editorContent.focus();
            }
        });
    }
}

/**
 * 投稿モーダルのメモ種類選択に応じて、入力欄の表示を切り替える
 */
function setupPostTypeSelectionLogic() {
    const postModal = document.getElementById('postModal');
    if (!postModal) return;

    const postTypeRadios = postModal.querySelectorAll('input[name="postType"]');
    const targetStockContainer = postModal.querySelector('#targetStockContainer');
    if (!postTypeRadios.length || !targetStockContainer) return;

    postTypeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const selectedType = event.target.value;
            if (selectedType === '個別銘柄メモ') {
                targetStockContainer.style.display = 'block';
            } else {
                targetStockContainer.style.display = 'none';
            }
        });
    });
}

/**
 * 説明（i）アイコンのモーダルを設定
 */
function setupInfoModalLogic() {
    const infoModal = document.getElementById('infoModal');
    const infoIcons = document.querySelectorAll('.info-icon');
    if (!infoModal || infoIcons.length === 0) return;

    const closeButton = infoModal.querySelector('.close-button');
    const openModal = () => infoModal.classList.add('active');
    const closeModal = () => infoModal.classList.remove('active');

    infoIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); e.preventDefault(); openModal();
        });
    });
    closeButton.addEventListener('click', closeModal);
    infoModal.addEventListener('click', (e) => { if (e.target === infoModal) closeModal(); });
}

/**
 * 銘柄検索モーダルの動作を設定
 */
function setupStockSearchModalLogic() {
    const stockSearchModal = document.getElementById('stockSearchModal');
    const postModal = document.getElementById('postModal');
    if (!stockSearchModal || !postModal) return;
    
    // 投稿モーダル内の「銘柄を選択」ボタン
    const triggerButton = postModal.querySelector('.select-target-button');
    if (!triggerButton) return;

    const closeButton = stockSearchModal.querySelector('.close-button');
    const openModal = () => stockSearchModal.classList.add('active');
    const closeModal = () => stockSearchModal.classList.remove('active');

    triggerButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    stockSearchModal.addEventListener('click', (e) => { if (e.target === stockSearchModal) closeModal(); });

    const resultsList = stockSearchModal.querySelector('.stock-search-results');
    const targetNameDisplay = postModal.querySelector('.target-name');

    if (resultsList && targetNameDisplay) {
        resultsList.addEventListener('click', (e) => {
            const selectedItem = e.target.closest('.stock-item');
            if (selectedItem) {
                targetNameDisplay.textContent = selectedItem.dataset.stockName;
                closeModal();
            }
        });
    }
}

/**
 * コンセンサスパネル（右パネル）の開閉ロジック
 */
/**
 * コンセンサスパネル（右パネル）の開閉ロジック
 * [変更点] view_moduleアイコンのクリックにも対応
 */
function setupConsensusPanel() {
    const subContainer = document.querySelector('.subContainer');
    if (!subContainer) return;

    // body全体のクリックを監視（イベント委任）
    document.body.addEventListener('click', (event) => {
        const target = event.target;

        // --- ▼▼▼ パネルを開く条件をここに追加 ▼▼▼ ---

        // 条件1: 'view_module' アイコンがクリックされた場合
        const isThemeIcon = target.classList.contains('material-icons') && target.textContent.trim() === 'view_module';
        // 条件2: '.open-consensus-text' がクリックされた場合
        const isConsensusText = target.classList.contains('open-consensus-text');

        if ((isThemeIcon && target.closest('.factor-card')) || isConsensusText) {
            subContainer.classList.add('show-right-panel');
        }

        // --- ▲▲▲ 変更はここまで ▲▲▲ ---


        // パネルを閉じる条件（変更なし）
        if (target.classList.contains('close-right-panel-button')) {
            subContainer.classList.remove('show-right-panel');
        }
    });
}
/**
 * 右側パネル（コンセンサス）の銘柄追加「+」ボタンの動作を設定
 */
function setupConsensusAddStockButton() {
    document.addEventListener('click', function(event) {
        const button = event.target.closest('.add-stock-button');
        if (button) {
            event.stopPropagation();
            openStockSearchModal();
        }
    });
}

/**
 * 銘柄検索モーダルを開く（必要ならHTMLを読み込む）
 */
async function openStockSearchModal() {
    if (!isModalsLoaded) {
        await loadModals();
    }
    
    const stockSearchModal = document.getElementById('stockSearchModal');
    if (stockSearchModal) {
        stockSearchModal.classList.add('active');
    } else {
        console.error('銘柄検索モーダルが見つかりません。');
    }
}

/**
 * インタラクティブなセンチメントボタンのクリックイベントを設定する
 */
function setupInteractiveSentimentControls() {
    document.body.addEventListener('click', function(event) {
        const clickedItem = event.target.closest('.sentiment-actions-interactive .sentiment-item');
        if (!clickedItem) return;
        event.stopPropagation();
        
        const container = clickedItem.closest('.sentiment-actions-interactive');
        if (!container) return;

        container.querySelectorAll('.sentiment-item').forEach(item => {
            item.classList.remove('selected');
        });
        clickedItem.classList.add('selected');
        
        console.log('選択されたセンチメント:', clickedItem.title);
    });
}