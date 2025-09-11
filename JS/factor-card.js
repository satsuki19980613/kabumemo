// factor-card.js の内容を以下のようにします

document.addEventListener('DOMContentLoaded', () => {
    // ページ内のすべての「操作可能なセンチメントボタン群」を取得
    const interactiveContainers = document.querySelectorAll('.sentiment-actions-interactive');

    interactiveContainers.forEach(container => {
        const sentimentItems = container.querySelectorAll('.sentiment-item');

        sentimentItems.forEach(item => {
            // 各ボタンにクリックイベントを設定
            item.addEventListener('click', (event) => {
                // 親要素へのイベント伝播を停止
                event.stopPropagation();

                // 同じグループ内のすべてのボタンから .selected クラスを削除
                sentimentItems.forEach(i => i.classList.remove('selected'));

                // クリックされたボタンにだけ .selected クラスを追加
                item.classList.add('selected');

                // (ここに選択結果を保存する処理などを追加できます)
                console.log('選択されたセンチメント:', item.title);
            });
        });
    });
});



