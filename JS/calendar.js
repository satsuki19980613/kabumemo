/**
 * 株メモ - カレンダー画面用スクリプト (calendar.js)
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- グローバル変数と定数 ---
    const calendarBody = document.getElementById('calendar-body');
    const monthYearDisplay = document.getElementById('month-year-display');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const memoList = document.getElementById('memo-list');

    let currentDate = new Date();

    // ダミーデータ：実際にはデータベースから取得する
    const allMemos = {
        '2025-08-01': [
            { user: 'アナリストA', title: '日銀、9月会合での追加利上げ観測が後退', content: '直近の全国消費者物価指数（CPI）の伸び率が市場予想を下回ったことを受け...', date: '8月1日', type: 'trend_plus' }
        ],
        '2025-08-14': [
            { user: 'My Name', title: '自分用の投資ルールまとめ', content: '1. PER/PBRが市場平均より著しく高い銘柄は避ける...', date: '8月14日', type: 'tweet', isPrivate: true },
            { user: '投資家B', title: '[決算] A社、第2四半期決算は予想を上回る', content: 'パウエル議長は講演で、インフレ抑制を最優先する姿勢を改めて強調...', date: '8月14日', type: 'trend' }
        ],
        '2025-07-28': [
            { user: 'My Name', title: 'A社の決算またぎ、ポジションどうするか', content: '今期のコンセンサスは強気だが、株価は織り込み済みか...', date: '7月28日', type: 'trend' }
        ]
    };


    /**
     * カレンダーを指定された年月で描画する関数
     */
    function renderCalendar() {
        calendarBody.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // 月と年を表示
        monthYearDisplay.textContent = `${year}年 ${month + 1}月`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const lastDayIndex = lastDay.getDay();
        const lastDayDate = lastDay.getDate();
        const prevLastDay = new Date(year, month, 0);
        const prevLastDayDate = prevLastDay.getDate();
        const nextDays = 7 - lastDayIndex - 1;

        // 前月の日付を描画
        for (let x = firstDay.getDay(); x > 0; x--) {
            calendarBody.innerHTML += `<div class="calendar-day other-month"><span>${prevLastDayDate - x + 1}</span></div>`;
        }

        // 今月の日付を描画
        for (let i = 1; i <= lastDayDate; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            let dayClass = 'calendar-day';
            if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                dayClass += ' today';
            }
            if (allMemos[dateStr]) {
                dayClass += ' has-memo';
            }
            calendarBody.innerHTML += `<div class="${dayClass}" data-date="${dateStr}"><span class="day-number">${i}</span></div>`;
        }

        // 来月の日付を描画
        for (let j = 1; j <= nextDays; j++) {
            calendarBody.innerHTML += `<div class="calendar-day other-month"><span>${j}</span></div>`;
        }
    }

    /**
     * 指定された日付のメモを表示する関数
     * @param {string} dateStr - 'YYYY-MM-DD'形式の日付文字列
     */
    function displayMemosForDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        selectedDateDisplay.textContent = `${month}月${day}日のメモ`;
        memoList.innerHTML = '';

        const memosForDay = allMemos[dateStr];

        if (memosForDay && memosForDay.length > 0) {
            memosForDay.forEach(memo => {
                const card = document.createElement('div');
                card.className = 'factor-card';
                // アイコンの種類を決定
                let typeIcon = 'chat_bubble_outline'; // つぶやき
                if (memo.type === 'trend') typeIcon = 'square';
                if (memo.type === 'trend_plus') typeIcon = 'view_module';

                card.innerHTML = `
                    <div class="factor-card-header">
                        <span class="user-name">${memo.user}</span>
                        <span class="post-date">${memo.date}</span>
                        <span class="post-type-icon" title="${memo.type}">
                            <span class="material-icons ${memo.type === 'trend' ? 'icon-square' : ''}">${typeIcon}</span>
                        </span>
                        ${memo.isPrivate ? `
                        <div class="private-indicator">
                        </div>` : ''}
                    </div>
                    <div class="factor-card-body">
                        <h4 class="factor-title">${memo.title}</h4>
                        <p class="factor-content">${memo.content}</p>
                    </div>
                `;
                memoList.appendChild(card);
            });
        } else {
            memoList.innerHTML = '<div class="no-memos">この日のメモはありません。</div>';
        }
    }

    // --- イベントリスナーの設定 ---

    // 前の月へボタン
    document.getElementById('prev-month-btn').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    // 次の月へボタン
    document.getElementById('next-month-btn').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // 日付クリック
    calendarBody.addEventListener('click', (e) => {
        const dayElement = e.target.closest('.calendar-day');
        if (dayElement && !dayElement.classList.contains('other-month')) {
            // 他の選択済みの日付から 'selected' クラスを削除
            const currentlySelected = calendarBody.querySelector('.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }
            // クリックされた日付に 'selected' クラスを追加
            dayElement.classList.add('selected');
            displayMemosForDate(dayElement.dataset.date);
        }
    });

    // --- 初期化処理 ---
    renderCalendar();
});
