// ===========================
// DOM要素の取得
// ===========================
const elements = {
  positiveStockModal: document.getElementById('positiveStockModalOverlay'),
  positiveStockList: document.getElementById('positiveStock'),
  selectedPositiveStockList: document.getElementById('selectedPositiveStock'),
  searchPositiveStockInput: document.getElementById('searchPositiveStockInput'),
  negativeStockModal: document.getElementById('negativeStockModalOverlay'),
  negativeStockList: document.getElementById('negativeStock'),
  selectedNegativeStockList: document.getElementById('selectedNegativeStock'),
  searchNegativeStockInput: document.getElementById('searchNegativeStockInput'),
};

// ===========================
// データ定義
// ===========================
const stockItems = [
  'INPEX（1605）',
  'JAPEX（1662）',
  'ENEOS（5020）',
  '出光興産（5019）',
  'コスモHD（5021）',
  'リアルゲイト（5532）',
];

const state = {
  positive: { selectedStocks: [] },
  negative: { selectedStocks: [] },
};

// ===========================
// 共通ヘルパー関数
// ===========================
function renderList(type, filter = '') {
  const listElement = elements[`${type}StockList`];
  const selected = state[type].selectedStocks;
  listElement.innerHTML = '';
  stockItems
    .filter(item => item.toLowerCase().includes(filter.toLowerCase()))
    .forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      li.classList.toggle('selected', selected.includes(item));
      li.onclick = () => toggleSelectStock(type, item);
      listElement.appendChild(li);
    });
}

function toggleSelectStock(type, item) {
  const selected = state[type].selectedStocks;
  const index = selected.indexOf(item);
  index === -1 ? selected.push(item) : selected.splice(index, 1);
  renderList(type, elements[`search${capitalize(type)}StockInput`].value);
  updateSelectedList(type);
}

function updateSelectedList(type) {
  const selected = state[type].selectedStocks;
  const container = elements[`selected${capitalize(type)}StockList`];
  container.innerHTML = selected.length
    ? selected.map(item => `<li class="selectedStock-item">${item}</li>`).join('')
    : '<li>選択中の銘柄: なし</li>';
}

function toggleModal(modal, show = true) {
  modal.style.display = show ? 'flex' : 'none';
  modal.classList.remove('fade-in', 'fade-out', 'active');
  if (show) {
    requestAnimationFrame(() => modal.classList.add('fade-in', 'active'));
  } else {
    modal.classList.add('fade-out');
    modal.addEventListener('animationend', function handler() {
      modal.classList.remove('fade-out');
      modal.removeEventListener('animationend', handler);
    });
  }
}

function showModal(type) {
  toggleModal(elements[`${type}StockModal`], true);
  renderList(type);
}

function closeModal(type) {
  toggleModal(elements[`${type}StockModal`], false);
}

// ===========================
// コントロールパネル処理
// ===========================
let pressTimer, currentItem = null, buttonGrid = null;

function startPress(element, event) {
  currentItem = element;
  pressTimer = setTimeout(() => showButtons(element, event), 300);
}

function cancelPress() {
  clearTimeout(pressTimer);
}

function showButtons(targetElement) {
  removeButtonGrid();
  buttonGrid = document.createElement('div');
  buttonGrid.className = 'button-grid';
  Object.assign(buttonGrid.style, {
    position: 'absolute',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: '9999',
  });

  const isLeft = targetElement.closest('.leftContainer');
  const labels = isLeft ? ['詳細', '編集', '関連ファクター', '削除'] : ['詳細', '編集', '削除', '関連銘柄'];

  labels.forEach(label => {
    const btn = document.createElement('button');
    Object.assign(btn.style, {
      all: 'unset',
      width: '80px',
      padding: '6px',
      textAlign: 'center',
      background: '#5353539c',
      color: '#ffffff',
      fontSize: '9.5px',
      boxSizing: 'border-box',
    });
    btn.textContent = label;
    btn.onclick = () => {
      alert(`${currentItem.innerText} の ${label} を選択しました`);
      removeButtonGrid();
    };
    btn.onmouseover = () => btn.style.background = '#6e8386';
    btn.onmouseout = () => btn.style.background = '#5353539c';
    buttonGrid.appendChild(btn);
  });

  const rect = targetElement.getBoundingClientRect();
  const margin = 5;
  const left = Math.min(window.innerWidth - 160 - margin, Math.max(margin, window.scrollX + rect.left + rect.width / 2 - 80));
  const top = window.scrollY + rect.bottom + margin;
  Object.assign(buttonGrid.style, { left: `${left}px`, top: `${top}px` });

  document.body.appendChild(buttonGrid);
  setTimeout(() => {
    document.addEventListener('click', outsideButtonClickHandler);
    document.addEventListener('touchstart', outsideButtonClickHandler);
  }, 0);
}

function removeButtonGrid() {
  if (buttonGrid) {
    document.body.removeChild(buttonGrid);
    buttonGrid = null;
    document.removeEventListener('click', outsideButtonClickHandler);
    document.removeEventListener('touchstart', outsideButtonClickHandler);
  }
}

function outsideButtonClickHandler(e) {
  if (buttonGrid && !buttonGrid.contains(e.target) && (!currentItem || !currentItem.contains(e.target))) {
    removeButtonGrid();
  }
}

// ===========================
// ユーティリティ
// ===========================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===========================
// イベントリスナー
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  ['positive', 'negative'].forEach(type => {
    updateSelectedList(type);
    elements[`search${capitalize(type)}StockInput`]?.addEventListener('input', e => {
      renderList(type, e.target.value);
    });

    elements[`${type}StockModal`]?.addEventListener('click', e => {
      if (e.target === elements[`${type}StockModal`]) closeModal(type);
    });
  });
});

// ===========================
// 公開関数
// ===========================
window.showPositiveStockModal = () => showModal('positive');
window.closePositiveStockModal = () => closeModal('positive');
window.showNegativeStockModal = () => showModal('negative');
window.closeNegativeStockModal = () => closeModal('negative');
window.startPress = startPress;
window.cancelPress = cancelPress;
