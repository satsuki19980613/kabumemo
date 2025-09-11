document.addEventListener('DOMContentLoaded', () => {

    const categoryRadios = document.querySelectorAll('input[name="searchCategory"]');
    const resultsContainer = document.querySelector('.search-results-container');

    const sampleData = {
        factor: [
            {
                title: 'トヨタ、国内全工場の稼働停止',
                snippet: '部品供給システムの不具合が原因とみられ...',
                typeIcon: 'view_module'
            },
            {
                title: '円相場、一時145円台に',
                snippet: '米国の利上げ長期化観測から、日米金利差が...',
                typeIcon: 'square',
                iconClass: 'icon-square'
            }
        ],
        hashtag: [
            { title: '決算発表', snippet: '3,456件のファクター' },
            { title: '株主優待', snippet: '1,234件のファクター' }
        ],
        stock: [
            { title: 'ソニーグループ', snippet: '6758 / プライム市場' },
            { title: '任天堂', snippet: '7974 / プライム市場' }
        ],
        user: [
            { userIcon: '../PIC/d2542be0c3cddf8f283bd1751b4ac5c9.jpeg', title: '個人投資家C' },
            { userIcon: '../PIC/peakpx (1).jpg', title: '証券アナリストB' }
        ]
    };

    const renderResults = (category) => {
        let html = '';
        const data = sampleData[category];

        switch (category) {
            case 'factor':
                html = `
                    <ul class="result-list" id="results-factor">
                        ${data.map(item => `
                            <li class="result-item factor-item">
                                <div class="item-content">
                                    <p class="item-title">${item.title}</p>
                                    <p class="item-snippet">${item.snippet}</p>
                                </div>
                                <span class="post-type-icon">
                                    <span class="material-icons ${item.iconClass || ''}">${item.typeIcon}</span>
                                </span>
                            </li>
                        `).join('')}
                    </ul>`;
                break;
            // ★★★ 削除されていたハッシュタグの描画処理を復元 ★★★
            case 'hashtag':
                html = `
                    <ul class="result-list" id="results-hashtag">
                        ${data.map(item => `
                            <li class="result-item hashtag-item">
                                <span class="hashtag-icon">#</span>
                                <div class="item-content">
                                    <p class="item-title">${item.title}</p>
                                    <p class="item-snippet">${item.snippet}</p>
                                </div>
                            </li>
                        `).join('')}
                    </ul>`;
                break;
            // ★★★ 削除されていた銘柄の描画処理を復元 ★★★
            case 'stock':
                html = `
                    <ul class="result-list" id="results-stock">
                        ${data.map(item => `
                            <a href="../HTML/stock-detail.html" class="result-item stock-item">
                                <span class="material-icons item-icon">show_chart</span>
                                <div class="item-content">
                                    <p class="item-title">${item.title}</p>
                                    <p class="item-snippet">${item.snippet}</p>
                                </div>
                            </a>
                        `).join('')}
                    </ul>`;
                break;
            case 'user':
                html = `
                    <ul class="result-list" id="results-user">
                        ${data.map(item => `
                            <a href="../HTML/other-profile.html" class="result-item user-item">
                                <img class="user-icon-small" src="${item.userIcon}" alt="user">
                                <div class="item-content">
                                    <p class="item-title">${item.title}</p>
                                </div>
                                <button class="follow-button">フォロー</button>
                            </a>
                        `).join('')}
                    </ul>`;
                break;
        }
        resultsContainer.innerHTML = html;
    };

    categoryRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            renderResults(radio.value);
        });
    });

    renderResults('factor');

// --- イベントリスナーの設定 ---

    // カテゴリが変更されたら結果を再描画
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            renderResults(radio.value);
        });
    });

    // ▼▼▼ ここから追加 ▼▼▼
    // 検索結果コンテナに対するクリックイベント（イベント委任）
    resultsContainer.addEventListener('click', (event) => {
        // クリックされた要素から最も近い .result-item を探す
        const resultItem = event.target.closest('.result-item');
        if (!resultItem) return; // 関係ない場所がクリックされた場合は何もしない

        // ハッシュタグアイテムかどうかをクラス名で判定
        if (resultItem.classList.contains('hashtag-item')) {
            // thread.htmlに遷移
            window.location.href = 'thread.html';
        }
        // 他のアイテム（例：'stock-item'）がクリックされた場合も、ここに追加の処理を記述できます
    });
    // ▲▲▲ ここまで追加 ▲▲▲


    // --- 初期表示 ---
    // 最初に「ファクター」の検索結果を表示
    renderResults('factor');
});



