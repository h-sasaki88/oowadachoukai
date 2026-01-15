/*
  script.js
  サイトの動きを制御するスクリプトです。
*/

// ボタンがクリックされたときに呼び出される関数
function showMessage() {
    alert("ボタンがクリックされました。\n詳細については役員までお問い合わせください。");
}

// ページ読み込み完了時にコンソールにメッセージを表示（開発者確認用）
console.log("大和田町会ホームページへようこそ");

// 組織図の表示・非表示を切り替える関数
function toggleSosiki() {
    var img0 = document.getElementById('sosiki-img-0');
    var img1 = document.getElementById('sosiki-img-1');
    var img2 = document.getElementById('sosiki-img-2');
    
    if (img1.style.display === 'none') {
        if (img0) img0.style.display = 'block';
        img1.style.display = 'block';
        img2.style.display = 'block';
    } else {
        if (img0) img0.style.display = 'none';
        img1.style.display = 'none';
        img2.style.display = 'none';
    }
}

// ギャラリーの表示・非表示を切り替える関数
function toggleGallery() {
    var gallery = document.getElementById('photo-gallery');
    if (gallery.style.display === 'none') {
        gallery.style.display = 'grid';
    } else {
        gallery.style.display = 'none';
    }
}

// カレンダーの表示・非表示を切り替える関数
function toggleCalendar() {
    var calendar = document.getElementById('calendar-container');
    if (calendar.style.display === 'none') {
        calendar.style.display = 'block';
    } else {
        calendar.style.display = 'none';
    }
}

// ブロック長・組長の役割詳細の表示・非表示を切り替える関数
function toggleRoleDetails() {
    var details = document.getElementById('role-details');
    if (details.style.display === 'none') {
        details.style.display = 'block';
    } else {
        details.style.display = 'none';
    }
}

/* 
  お問い合わせ掲示板機能 
*/
const STORAGE_KEY = 'owada_qa_data';
const ITEMS_PER_PAGE = 5; // 1回に表示する件数
let currentDisplayCount = ITEMS_PER_PAGE;

// ページ読み込み時にデータを表示
document.addEventListener('DOMContentLoaded', function() {
    // contact1.htmlが開かれている場合のみ実行
    if (document.getElementById('qa-list')) {
        currentDisplayCount = ITEMS_PER_PAGE; // 初期化
        renderQAList();
    }
});

// データの取得
function getQAData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// データの保存
function saveQAData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 日時フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP');
}

// 質問の投稿
function addQuestion() {
    const nameInput = document.getElementById('question-name');
    const contentInput = document.getElementById('question-content');
    
    const name = nameInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!name || !content) {
        alert('お名前と質問内容を入力してください。');
        return;
    }
    
    const data = getQAData();
    const newQuestion = {
        id: Date.now(), // ユニークIDとして現在時刻を使用
        type: 'question',
        name: name,
        date: new Date().toISOString(),
        content: content,
        replies: []
    };
    
    data.unshift(newQuestion); // 先頭に追加（最新を上に）
    saveQAData(data);
    
    nameInput.value = '';
    contentInput.value = '';
    
    renderQAList();
}

// 返信の投稿
function addReply(questionId) {
    const nameInput = document.getElementById(`reply-name-${questionId}`);
    const contentInput = document.getElementById(`reply-content-${questionId}`);
    
    const name = nameInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!name || !content) {
        alert('お名前（回答者）と回答内容を入力してください。');
        return;
    }
    
    const data = getQAData();
    const questionIndex = data.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
        const newReply = {
            name: name,
            date: new Date().toISOString(),
            content: content
        };
        
        data[questionIndex].replies.push(newReply);
        saveQAData(data);
        renderQAList();
    }
}

// 質問の削除
function deleteQuestion(id) {
    if (!confirm('この質問を削除してもよろしいですか？')) {
        return;
    }
    
    let data = getQAData();
    data = data.filter(q => q.id !== id);
    saveQAData(data);
    renderQAList();
}

// 質問の編集
function editQuestion(id) {
    const data = getQAData();
    const question = data.find(q => q.id === id);
    if (!question) return;

    const newContent = prompt('質問内容を編集:', question.content);
    if (newContent !== null && newContent.trim() !== "") {
        question.content = newContent.trim();
        saveQAData(data);
        renderQAList();
    }
}

// 返信の編集
function editReply(questionId, replyIndex) {
    const data = getQAData();
    const question = data.find(q => q.id === questionId);
    if (!question || !question.replies[replyIndex]) return;

    const reply = question.replies[replyIndex];
    const newContent = prompt('回答内容を編集:', reply.content);
    if (newContent !== null && newContent.trim() !== "") {
        reply.content = newContent.trim();
        saveQAData(data);
        renderQAList();
    }
}

// 返信の削除
function deleteReply(questionId, replyIndex) {
    if (!confirm('この回答を削除してもよろしいですか？')) {
        return;
    }
    const data = getQAData();
    const question = data.find(q => q.id === questionId);
    if (question && question.replies) {
        question.replies.splice(replyIndex, 1); // 配列から削除
        saveQAData(data);
        renderQAList();
    }
}

// リストの描画
function renderQAList() {
    const listContainer = document.getElementById('qa-list');
    const data = getQAData();
    
    listContainer.innerHTML = '';
    
    // 表示件数を制限してデータを取得
    const displayData = data.slice(0, currentDisplayCount);
    
    displayData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'qa-item';
        
        // 返信HTMLの生成
        let repliesHtml = '';
        if (item.replies && item.replies.length > 0) {
            repliesHtml = '<div class="reply-section"><h4>回答・返信</h4>';
            item.replies.forEach((reply, index) => {
                repliesHtml += `
                    <div class="reply-item">
                        <div class="qa-header">
                            <div class="qa-info">
                                <span class="qa-name">回答者: ${escapeHtml(reply.name)}</span>
                                <span class="qa-date">${formatDate(reply.date)}</span>
                            </div>
                            <div class="qa-actions">
                                <button class="edit-btn" onclick="editReply(${item.id}, ${index})">編集</button>
                                <button class="delete-btn" onclick="deleteReply(${item.id}, ${index})">削除</button>
                            </div>
                        </div>
                        <div class="qa-content">${escapeHtml(reply.content).replace(/\n/g, '<br>')}</div>
                    </div>
                `;
            });
            repliesHtml += '</div>';
        }
        
        // 質問HTMLの生成
        itemDiv.innerHTML = `
            <div class="qa-header">
                <div class="qa-info">
                    <span class="qa-name">質問者: ${escapeHtml(item.name)}</span>
                    <span class="qa-date">${formatDate(item.date)}</span>
                </div>
                <div class="qa-actions">
                    <button class="edit-btn" onclick="editQuestion(${item.id})">編集</button>
                    <button class="delete-btn" onclick="deleteQuestion(${item.id})">削除</button>
                </div>
            </div>
            <div class="qa-content">${escapeHtml(item.content).replace(/\n/g, '<br>')}</div>
            
            ${repliesHtml}
            
            <div class="reply-form">
                <input type="text" id="reply-name-${item.id}" placeholder="お名前（回答者）">
                <textarea id="reply-content-${item.id}" placeholder="回答・返信内容"></textarea>
                <button onclick="addReply(${item.id})">返信</button>
            </div>
        `;
        
        listContainer.appendChild(itemDiv);
    });

    // 「もっと見る」ボタンの追加
    if (data.length > currentDisplayCount) {
        const moreBtnDiv = document.createElement('div');
        moreBtnDiv.style.textAlign = 'center';
        moreBtnDiv.style.marginTop = '20px';
        
        const moreBtn = document.createElement('button');
        moreBtn.textContent = 'もっと見る';
        moreBtn.onclick = function() {
            currentDisplayCount += ITEMS_PER_PAGE;
            renderQAList();
        };
        
        moreBtnDiv.appendChild(moreBtn);
        listContainer.appendChild(moreBtnDiv);
    }
}

// HTMLエスケープ処理（XSS対策）
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escape[match];
    });
}

/* 
  トップページお知らせ機能 
*/
const NEWS_STORAGE_KEY = 'owada_news_data';
const NEWS_ITEMS_PER_PAGE = 5;
let currentNewsDisplayCount = NEWS_ITEMS_PER_PAGE;
const ADMIN_PASSWORD = '3298';

// お知らせエリアの表示切り替え
function toggleNews() {
    const newsArea = document.getElementById('news-area');
    if (newsArea.style.display === 'none') {
        newsArea.style.display = 'block';
        currentNewsDisplayCount = NEWS_ITEMS_PER_PAGE; // リセット
        renderNewsList();
    } else {
        newsArea.style.display = 'none';
    }
}

// お知らせデータの取得
function getNewsData() {
    const data = localStorage.getItem(NEWS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// お知らせデータの保存
function saveNewsData(data) {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(data));
}

// お知らせの投稿
function addNews() {
    const contentInput = document.getElementById('news-content-input');
    const importantInput = document.getElementById('news-important');
    const content = contentInput.value.trim();
    
    if (!content) {
        alert('お知らせ内容を入力してください。');
        return;
    }

    const password = prompt('投稿するには管理者パスワードを入力してください:');
    if (password !== ADMIN_PASSWORD) {
        alert('パスワードが違います。');
        return;
    }

    const data = getNewsData();
    const newNews = {
        id: Date.now(),
        date: new Date().toISOString(),
        content: content,
        isImportant: importantInput.checked
    };
    
    data.unshift(newNews);
    saveNewsData(data);
    contentInput.value = '';
    importantInput.checked = false;
    renderNewsList();
}

// お知らせの削除
function deleteNews(id) {
    const password = prompt('削除するには管理者パスワードを入力してください:');
    if (password !== ADMIN_PASSWORD) {
        alert('パスワードが違います。');
        return;
    }

    if (!confirm('本当に削除しますか？')) {
        return;
    }

    let data = getNewsData();
    data = data.filter(item => item.id !== id);
    saveNewsData(data);
    renderNewsList();
}

// お知らせリストの描画
function renderNewsList() {
    const listContainer = document.getElementById('news-list');
    if (!listContainer) return;
    
    const data = getNewsData();
    listContainer.innerHTML = '';

    if (data.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #666;">現在お知らせはありません。</p>';
        return;
    }
    
    const displayData = data.slice(0, currentNewsDisplayCount);
    
    displayData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'qa-item';
        itemDiv.style.borderLeft = '5px solid #ff9800'; // お知らせ用のアクセントカラー
        
        let labelHtml = '';
        let contentClass = 'qa-content';
        if (item.isImportant) {
            labelHtml = '<span class="news-label-important">重要</span>';
            contentClass += ' news-text-orange';
        }

        itemDiv.innerHTML = `
            <div class="qa-header">
                <div class="qa-info">
                    ${labelHtml}
                    <span class="qa-date">${formatDate(item.date)}</span>
                </div>
                <div class="qa-actions">
                    <button class="delete-btn" onclick="deleteNews(${item.id})">削除</button>
                </div>
            </div>
            <div class="${contentClass}">${escapeHtml(item.content).replace(/\n/g, '<br>')}</div>
        `;
        listContainer.appendChild(itemDiv);
    });

    if (data.length > currentNewsDisplayCount) {
        const moreBtnDiv = document.createElement('div');
        moreBtnDiv.style.textAlign = 'center';
        moreBtnDiv.style.marginTop = '20px';
        
        const moreBtn = document.createElement('button');
        moreBtn.textContent = 'もっと見る';
        moreBtn.onclick = function() {
            currentNewsDisplayCount += NEWS_ITEMS_PER_PAGE;
            renderNewsList();
        };
        
        moreBtnDiv.appendChild(moreBtn);
        listContainer.appendChild(moreBtnDiv);
    }
}

/* 
  会館予約システム 
*/
const RES_STORAGE_KEY = 'owada_reservation_data';
const RES_PASSWORD = '3298';
let currentResStartDate = new Date(); // 表示開始日

// 予約エリアの表示切り替え
function toggleReservation() {
    const resArea = document.getElementById('reservation-area');
    if (resArea.style.display === 'none') {
        resArea.style.display = 'block';
        currentResStartDate = new Date(); // 今日から表示
        renderReservationTable();
    } else {
        resArea.style.display = 'none';
    }
}

// 予約ページの切り替え
function changeReservationPage(offset) {
    const newDate = new Date(currentResStartDate);
    newDate.setDate(newDate.getDate() + offset);
    
    // 今日より前には戻さない
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newDate < today) {
        currentResStartDate = new Date(today);
    } else {
        currentResStartDate = newDate;
    }
    renderReservationTable();
}

// 予約データの取得
function getReservationData() {
    const data = localStorage.getItem(RES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 予約データの保存
function saveReservationData(data) {
    localStorage.setItem(RES_STORAGE_KEY, JSON.stringify(data));
}

// 予約の追加
function addReservation(dateKey, place, time) {
    const password = prompt('予約するにはパスワードを入力してください:');
    if (password !== RES_PASSWORD) {
        alert('パスワードが違います。');
        return;
    }

    const name = prompt('予約者名を入力してください:');
    if (name === null) return; // キャンセル
    if (!name.trim()) {
        alert('予約者名を入力してください。');
        return;
    }

    const content = prompt('利用内容を入力してください:');
    if (content === null) return; // キャンセル
    if (!content.trim()) {
        alert('利用内容を入力してください。');
        return;
    }

    const data = getReservationData();
    const newRes = {
        id: Date.now(),
        date: dateKey,
        place: place,
        time: time,
        name: name.trim(),
        content: content.trim()
    };

    data.push(newRes);
    saveReservationData(data);
    renderReservationTable();
}

// 予約の削除
function deleteReservation(id) {
    const password = prompt('削除するにはパスワードを入力してください:');
    if (password !== RES_PASSWORD) {
        alert('パスワードが違います。');
        return;
    }

    if (!confirm('この予約を削除してもよろしいですか？')) {
        return;
    }

    let data = getReservationData();
    data = data.filter(item => item.id !== id);
    saveReservationData(data);
    renderReservationTable();
}

// 予約テーブルの描画
function renderReservationTable() {
    const container = document.getElementById('reservation-table-container');
    if (!container) return;

    const data = getReservationData();
    
    // 表示開始日と終了日の計算
    const startDate = new Date(currentResStartDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 13);

    // 今日の日付（過去日の判定用）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3ヶ月制限（約90日後）
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 90);

    // ナビゲーションボタンのHTML
    const isPrevDisabled = startDate <= today;
    const isNextDisabled = endDate >= maxDate;

    let navHtml = `<div style="display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;">
        <button class="res-btn" onclick="changeReservationPage(-14)" ${isPrevDisabled ? 'disabled style="opacity:0.5; cursor:default; background-color:#ccc;"' : ''}>＜ 前の2週間</button>
        <span style="font-weight:bold;">${startDate.toLocaleDateString()} ～ ${endDate.toLocaleDateString()}</span>
        <button class="res-btn" onclick="changeReservationPage(14)" ${isNextDisabled ? 'disabled style="opacity:0.5; cursor:default; background-color:#ccc;"' : ''}>次の2週間 ＞</button>
    </div>`;

    let html = navHtml + '<table class="res-table">';
    html += '<thead><tr><th>日付</th><th>1階 午前</th><th>1階 午後</th><th>2階 午前</th><th>2階 午後</th></tr></thead>';
    html += '<tbody>';

    // 向こう14日分を表示
    for (let i = 0; i < 14; i++) {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + i);
        
        const dateStr = targetDate.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
        const dateKey = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD形式

        html += `<tr><td>${dateStr}</td>`;
        
        // 各枠（場所・時間）のセル生成
        const slots = [
            { place: '1F', time: 'AM' },
            { place: '1F', time: 'PM' },
            { place: '2F', time: 'AM' },
            { place: '2F', time: 'PM' }
        ];

        slots.forEach(slot => {
            const reservation = data.find(r => r.date === dateKey && r.place === slot.place && r.time === slot.time);
            
            if (reservation) {
                // 予約済み
                html += `<td class="res-cell-booked">
                    <div><strong>${escapeHtml(reservation.name)}</strong></div>
                    <div style="font-size:12px;">${escapeHtml(reservation.content)}</div>
                    <button class="res-delete-btn" onclick="deleteReservation(${reservation.id})">削除</button>
                </td>`;
            } else {
                // 空き（過去の日付は予約不可にする）
                if (targetDate < today) {
                    html += `<td style="background-color:#f5f5f5; color:#999;">-</td>`;
                } else {
                    html += `<td>
                        <button class="res-btn" onclick="addReservation('${dateKey}', '${slot.place}', '${slot.time}')">予約</button>
                    </td>`;
                }
            }
        });

        html += '</tr>';
    }

    html += '</tbody></table>';
    html += navHtml; // 下部にもナビゲーションを表示
    container.innerHTML = html;
}