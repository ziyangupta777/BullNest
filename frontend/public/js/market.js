// =============================================
// MARKET.JS — Market page + buy/sell logic
// =============================================

const Market = {
  allAssets: [],
  filtered: [],
  currentFilter: 'all',
  currentSort: 'name',
  searchTerm: '',
  selectedChartAsset: null,
  chartPriceHistory: [],
  chartLabels: [],

  // Called once on page load to fetch all assets
  async init() {
    const res = await Api.allAssets();
    if (res.success) {
      this.allAssets = res.data;
      this.filtered = [...this.allAssets];
      this.renderMoversGrid();
      this.renderCryptoDash();
      this.renderMarketTable();
      this.initMainChart(this.allAssets[0]);
      this.buildChartAssetList();
    }
  },

  // Update prices from socket
  updatePrices(updates) {
    updates.forEach(u => {
      const idx = this.allAssets.findIndex(a => a.symbol === u.symbol);
      if (idx > -1) {
        this.allAssets[idx].currentPrice = u.currentPrice;
        this.allAssets[idx].change24h = u.change24h;
      }
    });
    this.filtered = this.applyFiltersAndSort();
    this.refreshTablePrices(updates);
    this.refreshCardPrices(updates);
    this.updateTicker(updates);

    // Live-append to main chart
    if (this.selectedChartAsset) {
      const u = updates.find(x => x.symbol === this.selectedChartAsset.symbol);
      if (u) {
        const now = new Date();
        const lbl = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
        Charts.appendPrice('mainStockChart', u.currentPrice, lbl);
        document.getElementById('chartPrice').textContent = '₹' + u.currentPrice.toLocaleString('en-IN');
        const chgEl = document.getElementById('chartChange');
        const up = u.change24h >= 0;
        chgEl.textContent = `${up?'▲':'▼'} ${Math.abs(u.change24h).toFixed(2)}% Today`;
        chgEl.className = 'panel-chg ' + (up ? 'up' : 'down');
      }
    }
  },

  applyFiltersAndSort() {
    let arr = [...this.allAssets];
    // Filter
    if (this.currentFilter === 'stock') arr = arr.filter(a => a.type === 'stock');
    else if (this.currentFilter === 'crypto') arr = arr.filter(a => a.type === 'crypto');
    else if (this.currentFilter === 'gainers') arr = arr.filter(a => a.change24h > 0);
    else if (this.currentFilter === 'losers') arr = arr.filter(a => a.change24h < 0);
    // Search
    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      arr = arr.filter(a => a.name.toLowerCase().includes(s) || a.symbol.toLowerCase().includes(s));
    }
    // Sort
    if (this.currentSort === 'price_high') arr.sort((a,b) => b.currentPrice - a.currentPrice);
    else if (this.currentSort === 'price_low') arr.sort((a,b) => a.currentPrice - b.currentPrice);
    else if (this.currentSort === 'change_high') arr.sort((a,b) => b.change24h - a.change24h);
    else if (this.currentSort === 'change_low') arr.sort((a,b) => a.change24h - b.change24h);
    else arr.sort((a,b) => a.name.localeCompare(b.name));
    return arr;
  },

  renderMoversGrid() {
    const container = document.getElementById('moversGrid');
    if (!container) return;
    let assets = [...this.allAssets];
    const filter = container.dataset.filter || 'gainers';
    if (filter === 'gainers') assets = assets.filter(a => a.change24h > 0).sort((a,b) => b.change24h - a.change24h);
    else if (filter === 'losers') assets = assets.filter(a => a.change24h < 0).sort((a,b) => a.change24h - b.change24h);
    else if (filter === 'stocks') assets = assets.filter(a => a.type === 'stock');
    else if (filter === 'crypto') assets = assets.filter(a => a.type === 'crypto');
    assets = assets.slice(0, 8);
    container.innerHTML = assets.map(a => this.cardHTML(a)).join('');
    setTimeout(() => assets.forEach(a => Charts.mini(`mini_${a.symbol}`, a.currentPrice, a.change24h >= 0)), 80);
  },

  cardHTML(a) {
    const up = a.change24h >= 0;
    const price = a.currentPrice.toLocaleString('en-IN');
    const sym = a.symbol.substring(0,4);
    return `<div class="market-card" id="card_${a.symbol}">
      <div class="mc-top">
        <div class="mc-icon" style="background:${a.logoColor}18;color:${a.logoColor}">${sym}</div>
        <span class="mc-badge ${up?'up':'down'}">${up?'▲':'▼'} ${Math.abs(a.change24h).toFixed(2)}%</span>
      </div>
      <div class="mc-sym">${a.symbol}</div>
      <div class="mc-name">${a.name}</div>
      <div class="mc-price" id="cp_${a.symbol}">₹${price}</div>
      <div class="mc-change ${up?'up':'down'}" id="cc_${a.symbol}">${up?'▲':'▼'} ${Math.abs(a.change24h).toFixed(2)}% today</div>
      <div class="mc-mini"><canvas id="mini_${a.symbol}" height="44" role="img" aria-label="${a.name} mini chart"></canvas></div>
      <div class="mc-actions">
        <button class="btn-primary btn-sm" onclick="Market.openTrade('${a.symbol}','buy')">Buy</button>
        <button class="btn-outline btn-sm btn-sell" onclick="Market.openTrade('${a.symbol}','sell')">Sell</button>
      </div>
    </div>`;
  },

  renderCryptoDash() {
    const container = document.getElementById('dashCryptoGrid');
    if (!container) return;
    const cryptos = this.allAssets.filter(a => a.type === 'crypto').slice(0, 8);
    container.innerHTML = cryptos.map(a => {
      const up = a.change24h >= 0;
      const sym = a.symbol.substring(0,4);
      return `<div class="crypto-card" onclick="Market.openTrade('${a.symbol}','buy')">
        <div class="cc-icon" style="background:${a.logoColor}18;color:${a.logoColor}">${sym}</div>
        <div class="cc-info">
          <div class="cc-name">${a.name}</div>
          <div class="cc-sym">${a.symbol}</div>
        </div>
        <div class="cc-right">
          <div class="cc-price" id="ccp_${a.symbol}">₹${a.currentPrice.toLocaleString('en-IN')}</div>
          <div class="cc-chg ${up?'up':'down'}" id="ccc_${a.symbol}">${up?'▲':'▼'} ${Math.abs(a.change24h).toFixed(2)}%</div>
        </div>
      </div>`;
    }).join('');
  },

  renderMarketTable() {
    const tbody = document.getElementById('marketTableBody');
    if (!tbody) return;
    this.filtered = this.applyFiltersAndSort();
    if (!this.filtered.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="table-loading">No assets found</td></tr>`;
      return;
    }
    tbody.innerHTML = this.filtered.map((a, i) => {
      const up = a.change24h >= 0;
      const vol = a.volume >= 1e7 ? (a.volume/1e7).toFixed(1)+'Cr' : (a.volume/1e5).toFixed(1)+'L';
      const sym = a.symbol.substring(0,4);
      return `<tr>
        <td class="muted">${i+1}</td>
        <td>
          <div class="asset-cell">
            <div class="asset-logo" style="background:${a.logoColor}18;color:${a.logoColor}">${sym}</div>
            <div>
              <div class="asset-name-full">${a.name}</div>
              <div class="asset-sym-small">${a.symbol}</div>
            </div>
          </div>
        </td>
        <td><span class="type-badge ${a.type}">${a.type}</span></td>
        <td class="price-cell" id="tp_${a.symbol}">₹${a.currentPrice.toLocaleString('en-IN')}</td>
        <td class="chg-cell ${up?'up':'down'}" id="tc_${a.symbol}">${up?'▲':'▼'} ${Math.abs(a.change24h).toFixed(2)}%</td>
        <td class="vol-cell">${vol}</td>
        <td>
          <div class="action-btns">
            <button class="btn-primary btn-sm" onclick="Market.openTrade('${a.symbol}','buy')">Buy</button>
            <button class="btn-outline btn-sm" style="border-color:rgba(255,71,87,.3);color:#FF4757" onclick="Market.openTrade('${a.symbol}','sell')">Sell</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  refreshTablePrices(updates) {
    updates.forEach(u => {
      const el = document.getElementById('tp_' + u.symbol);
      const elc = document.getElementById('tc_' + u.symbol);
      if (el) {
        el.textContent = '₹' + u.currentPrice.toLocaleString('en-IN');
        el.style.color = u.currentPrice > u.prevPrice ? '#00C896' : '#FF4757';
        setTimeout(() => { if(el) el.style.color = ''; }, 600);
      }
      if (elc) {
        const up = u.change24h >= 0;
        elc.textContent = `${up?'▲':'▼'} ${Math.abs(u.change24h).toFixed(2)}%`;
        elc.className = 'chg-cell ' + (up ? 'up' : 'down');
      }
    });
  },

  refreshCardPrices(updates) {
    updates.forEach(u => {
      const el = document.getElementById('cp_' + u.symbol);
      const ec = document.getElementById('cc_' + u.symbol);
      const ccp = document.getElementById('ccp_' + u.symbol);
      const ccc = document.getElementById('ccc_' + u.symbol);
      if (el) el.textContent = '₹' + u.currentPrice.toLocaleString('en-IN');
      if (ec) {
        const up = u.change24h >= 0;
        ec.textContent = `${up?'▲':'▼'} ${Math.abs(u.change24h).toFixed(2)}% today`;
        ec.className = 'mc-change ' + (up ? 'up' : 'down');
      }
      if (ccp) ccp.textContent = '₹' + u.currentPrice.toLocaleString('en-IN');
      if (ccc) {
        const up = u.change24h >= 0;
        ccc.textContent = `${up?'▲':'▼'} ${Math.abs(u.change24h).toFixed(2)}%`;
        ccc.className = 'cc-chg ' + (up ? 'up' : 'down');
      }
    });
  },

  updateTicker(updates) {
    const inner = document.getElementById('tickerContent');
    if (!inner || !updates.length) return;
    const doubled = [...updates, ...updates];
    inner.innerHTML = doubled.map(u => {
      const up = u.change24h >= 0;
      return `<div class="tick-item">
        <span class="tick-sym">${u.symbol}</span>
        <span class="tick-price">₹${u.currentPrice.toLocaleString('en-IN')}</span>
        <span class="tick-chg ${up?'up':'down'}">${up?'▲':'▼'} ${Math.abs(u.change24h).toFixed(2)}%</span>
      </div>`;
    }).join('');
  },

  initMainChart(asset) {
    if (!asset) return;
    this.selectedChartAsset = asset;
    const prices = Charts.genSparkData(24, asset.currentPrice, asset.change24h >= 0);
    const labels = [];
    for (let i = 0; i < 24; i++) {
      const h = (9 + Math.floor(i/2)) % 24;
      labels.push(`${h}:${i%2===0?'00':'30'}`);
    }
    Charts.main('mainStockChart', prices, labels, asset.change24h >= 0);
    document.getElementById('chartAssetName').textContent = asset.name.toUpperCase();
    document.getElementById('chartPrice').textContent = '₹' + asset.currentPrice.toLocaleString('en-IN');
    const chgEl = document.getElementById('chartChange');
    const up = asset.change24h >= 0;
    chgEl.textContent = `${up?'▲':'▼'} ${Math.abs(asset.change24h).toFixed(2)}% Today`;
    chgEl.className = 'panel-chg ' + (up ? 'up' : 'down');
  },

  buildChartAssetList() {
    const container = document.getElementById('chartAssetList');
    if (!container) return;
    const top = this.allAssets.slice(0, 6);
    container.innerHTML = top.map((a, i) => `
      <button class="cal-btn ${i===0?'active':''}" onclick="Market.switchChartAsset('${a.symbol}',this)">${a.symbol}</button>
    `).join('');
  },

  switchChartAsset(symbol, btn) {
    const asset = this.allAssets.find(a => a.symbol === symbol);
    if (!asset) return;
    document.querySelectorAll('.cal-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.initMainChart(asset);
  },

  // ---- BUY / SELL MODAL ----
  openTrade(symbol, type) {
    const asset = this.allAssets.find(a => a.symbol === symbol);
    if (!asset) return;
    if (!App.user) {
      App.showToast('Please login to trade', 'error');
      navigate('login');
      return;
    }
    const isBuy = type === 'buy';
    const box = document.getElementById('modal-box');
    box.innerHTML = `
      <div class="modal-title">${isBuy ? '🟢 Buy' : '🔴 Sell'} ${asset.symbol}</div>
      <div class="modal-sub">${asset.name} · Current Price: <strong style="color:var(--accent)">₹${asset.currentPrice.toLocaleString('en-IN')}</strong></div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:var(--muted)">
        ${isBuy
          ? `Wallet Balance: <strong style="color:var(--text)">₹${(App.user.walletBalance||0).toLocaleString('en-IN')}</strong>`
          : `Your Holdings: <strong style="color:var(--text)" id="holdingInfo">Loading...</strong>`}
      </div>
      <div class="form-group">
        <label>Quantity</label>
        <input type="number" id="tradeQty" placeholder="${asset.type==='crypto'?'e.g. 0.5':'e.g. 5'}" step="${asset.type==='crypto'?'0.0001':'1'}" min="${asset.type==='crypto'?'0.0001':'1'}" />
      </div>
      <div id="tradeCostDisplay" style="font-size:13px;color:var(--muted);margin-bottom:16px;min-height:20px"></div>
      <div class="modal-actions">
        <button class="btn-outline" style="flex:1" onclick="closeModal()">Cancel</button>
        <button class="${isBuy?'btn-primary':'btn-primary btn-sell'}" style="flex:2" onclick="Market.executeTrade('${symbol}','${type}')">
          ${isBuy ? 'Confirm Buy' : 'Confirm Sell'}
        </button>
      </div>`;
    document.getElementById('modal-overlay').classList.remove('hidden');

    // Live cost calc
    const qtyInput = document.getElementById('tradeQty');
    qtyInput.addEventListener('input', () => {
      const qty = parseFloat(qtyInput.value) || 0;
      const total = qty * asset.currentPrice;
      const el = document.getElementById('tradeCostDisplay');
      if (qty > 0) {
        el.innerHTML = `Total ${isBuy?'Cost':'Revenue'}: <strong style="color:var(--accent)">₹${total.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</strong>`;
      } else el.textContent = '';
    });
    qtyInput.focus();

    // Load holding info for sell
    if (!isBuy) {
      Api.portfolio().then(res => {
        const el = document.getElementById('holdingInfo');
        if (!el) return;
        if (res.success) {
          const h = res.data.holdings.find(x => x.symbol === symbol);
          el.textContent = h ? `${h.quantity} ${symbol}` : `0 ${symbol}`;
        }
      });
    }
  },

  async executeTrade(symbol, type) {
    const qty = parseFloat(document.getElementById('tradeQty').value);
    if (!qty || qty <= 0) { App.showToast('Enter a valid quantity', 'error'); return; }

    App.showLoading(true);
    const res = type === 'buy' ? await Api.buy(symbol, qty) : await Api.sell(symbol, qty);
    App.showLoading(false);

    if (res.success) {
      closeModal();
      App.showToast(res.message, 'success');
      // Update wallet
      if (res.data && res.data.newBalance !== undefined) {
        App.user.walletBalance = res.data.newBalance;
        App.updateNavBalance();
      }
      // Refresh portfolio if visible
      if (document.getElementById('page-portfolio').classList.contains('active')) {
        Portfolio.load();
      }
      if (document.getElementById('dashPortfolioPanel')) {
        Portfolio.loadDash();
      }
    } else {
      App.showToast(res.message || 'Trade failed', 'error');
    }
  }
};

// Global filter helpers wired to HTML buttons
function filterMovers(filter, btn) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const grid = document.getElementById('moversGrid');
  if (grid) { grid.dataset.filter = filter; Market.renderMoversGrid(); }
}

function setMarketFilter(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  Market.currentFilter = filter;
  Market.renderMarketTable();
}

function sortMarket(val) {
  Market.currentSort = val;
  Market.renderMarketTable();
}

function filterMarket() {
  Market.searchTerm = document.getElementById('marketSearch').value;
  Market.renderMarketTable();
}

function setPeriod(p, btn) {
  document.querySelectorAll('.period').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Re-generate chart data for the period
  const asset = Market.selectedChartAsset;
  if (!asset) return;
  const len = p === '1D' ? 24 : p === '1W' ? 42 : p === '1M' ? 30 : 90;
  const prices = Charts.genSparkData(len, asset.currentPrice, asset.change24h >= 0);
  Charts.main('mainStockChart', prices, Array(len).fill(''), asset.change24h >= 0);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-box').innerHTML = '';
}
// Close on overlay click
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') closeModal();
});
