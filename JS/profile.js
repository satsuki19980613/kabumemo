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
// profile.js 内の loadProfileFactorCards 関数を置き換え
function loadProfileFactorCards() { // async は不要に
    try {
        // HTMLからテンプレートを取得
        const template = document.getElementById('factor-card-template');
        if (!template) throw new Error('factor-card-template が見つかりません。');

        const factorCards = template.content.querySelectorAll('.factor-card');
        const listContainer = document.querySelector('.profile-page-container .factor-list');
        if (!listContainer) return;

        listContainer.innerHTML = ''; // コンテナを一度空にする
        factorCards.forEach(card => {
            listContainer.appendChild(card.cloneNode(true));
        });

    } catch (error) {
        console.error("ファクターの読み込みに失敗:", error);
        const listContainer = document.querySelector('.profile-page-container .factor-list');
        if (listContainer) {
            listContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #888;">ファクターの読み込みに失敗しました。</p>';
        }
    }
}