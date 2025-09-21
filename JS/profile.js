/**
 * 株メモ - プロフィール画面用スクリプト (profile.js)
 */
document.addEventListener('DOMContentLoaded', () => {
    // ページが読み込まれたら、ファクターカードを読み込む関数を実行
    loadProfileFactorCards();
});

/**
 * 機能：factor-card.htmlからファクターカードを読み込み、
 * プロフィールページのファクターリストに表示する
 */
async function loadProfileFactorCards() {
    try {
        // factor-card.htmlの内容を非同期で取得
        const response = await fetch('../HTML/factor-card.html');
        if (!response.ok) {
            throw new Error('factor-card.htmlの読み込みに失敗しました。');
        }
        const templateText = await response.text();

        // 取得したHTML文字列を一時的なDOM要素に変換
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateText;

        // テンプレートからすべてのファクターカード要素を取得
        const factorCards = tempDiv.querySelectorAll('.factor-card');
        
        // profile.html内の表示先コンテナを取得
        const listContainer = document.querySelector('.profile-page-container .factor-list');
        if (!listContainer) {
            console.error('表示先のコンテナ（.factor-list）が見つかりません。');
            return;
        }

        // 表示先のコンテナを一度空にする
        listContainer.innerHTML = ''; 
        
        // 取得したファクターカードを1つずつコンテナに追加
        factorCards.forEach(card => {
            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error("ファクターの読み込みに失敗:", error);
        const listContainer = document.querySelector('.profile-page-container .factor-list');
        if (listContainer) {
            listContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #888;">ファクターの読み込みに失敗しました。</p>';
        }
    }
}