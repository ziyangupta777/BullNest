// =============================================
// PORTFOLIO.JS — Portfolio & transactions
// =============================================

const Portfolio = {
  data: null,
  txnFilter: 'all',

  async load() {
    if (!App.user) return;
    const wrap = document.getElementById('portfolioContent');
    if (wrap) wrap.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted)">Loading portfolio...</div>';

    const res = await Api.portfolio();
    if (!res.success) {
      if (wrap) wrap.innerHTML = `<div class="login-prompt-full"><h3>${res.message}</h3></div>`;
      return;
    }
    this.data = res.data;
    this.renderPortfolioPage(res.data);
  },

  renderPortfolioPage(data) {
    const wrap = document.getElementById('portfolioContent');
    if (!wrap) return;
    const { summary, holdings } = data;
    const pnlUp = summary.totalPnl >= 0;

    wrap.innerHTML = `
      <div class="portfolio-wrap">
        <div class="port-summary-cards">
          <div class="psc">
            <div class="psc-label">Invested</div>
            <div class="psc-val">₹${summary.totalInvested.toLocaleString('en-IN')}</div>
            <div class="psc-sub">Total amount invested</div>
          </div>
          <div class="psc">
            <div class="psc-label">Current Value</div>
            <div class="psc-val ${pnlUp?'up':'down'}">₹${summary.currentValue.toLocaleString('en-IN')}</div>
            <div class="psc-sub">Live market value</div>
          </div>
          <div class="psc">
            <div class="psc-label">Total P&L</div>
            <div class="psc-val ${pnlUp?'up':'down'}">${pnlUp?'+':''}₹${summary.totalPnl.toLocaleString('en-IN')}</div>
            <div class="psc-sub ${pnlUp?'up':'down'}">${pnlUp?'▲':'▼'} ${Math.abs(summary.totalPnlPct).toFixed(2)}%</div>
          </div>
          <div class="psc">
            <div class="psc-label">Holdings</div>
            <div class="psc-val">${summary.holdingsCount}</div>
            <div class="psc-sub">Active positions</div>
          </div>
        </div>

        ${holdings.length === 0 ? `
          <div class="no-holdings">
            <div style="font-size:40px;margin-bottom:14px">📊</div>
            <h3 style="margin-bottom:8px">No holdings yet</h3>
            <p style="color:var(--muted);margin-bottom:20px">Go buy your first stock or crypto!</p>
            <button class="btn-primary" onclick="navigate('market')">Explore Markets</button>
          </div>` : `
        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px;margin-bottom:24px;align-items:start">
          <div class="holdings-table-wrap">
            <table class="holdings-table">
              <thead><tr>
                <th>Asset</th><th>Qty</th><th>Avg Price</th><th>Current</th><th>Invested</th><th>Value</th><th>P&L</th><th>Action</th>
              </tr></thead>
              <tbody>
                ${holdings.map(h => {
                  const pnlUp = h.pnl >= 0;
                  return `<tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        <div style="width:30px;height:30px;border-radius:8px;background:${h.logoColor||'#00E5A0'}18;color:${h.logoColor||'#00E5A0'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">${h.symbol.substring(0,4)}</div>
                        <div>
                          <div style="font-weight:500;font-size:12px">${h.name}</div>
                          <div style="font-size:10px;color:var(--muted)">${h.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td style="font-family:'DM Mono',monospace">${h.quantity <= 1 ? h.quantity.toFixed(4) : h.quantity.toFixed(2)}</td>
                    <td style="font-family:'DM Mono',monospace">₹${h.avgBuyPrice.toLocaleString('en-IN')}</td>
                    <td style="font-family:'DM Mono',monospace">₹${h.currentPrice.toLocaleString('en-IN')}</td>
                    <td style="font-family:'DM Mono',monospace">₹${h.totalInvested.toLocaleString('en-IN')}</td>
                    <td style="font-family:'DM Mono',monospace">₹${h.currentValue.toLocaleString('en-IN')}</td>
                    <td>
                      <div class="${pnlUp?'up':'down'}" style="font-family:'DM Mono',monospace;font-size:12px">${pnlUp?'+':''}₹${h.pnl.toLocaleString('en-IN')}</div>
                      <div class="${pnlUp?'up':'down'}" style="font-size:10px">${pnlUp?'▲':'▼'} ${Math.abs(h.pnlPct).toFixed(2)}%</div>
                    </td>
                    <td><button class="btn-outline btn-sm" style="border-color:rgba(255,71,87,.3);color:#FF4757;font-size:11px" onclick="Market.openTrade('${h.symbol}','sell')">Sell</button></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px">
            <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:16px">Allocation</div>
            <div style="position:relative;height:200px"><canvas id="portDonut" role="img" aria-label="Portfolio allocation"></canvas></div>
            <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px">
              ${holdings.slice(0,5).map((h,i) => {
                const colors = ['#00E5A0','#7B61FF','#F5C842','#FF6B35','#378ADD'];
                const pct = summary.currentValue > 0 ? ((h.currentValue / summary.currentValue)*100).toFixed(1) : 0;
                return `<div style="display:flex;align-items:center;justify-content:space-between">
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:8px;height:8px;border-radius:50%;background:${colors[i%colors.length]}"></div>
                    <span style="font-size:13px">${h.symbol}</span>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:13px;font-family:'DM Mono',monospace">₹${h.currentValue.toLocaleString('en-IN')}</div>
                    <div style="font-size:11px;color:var(--muted)">${pct}%</div>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>`}

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700">Transaction <span style="color:var(--accent)">History</span></div>
          <button class="btn-outline btn-sm" onclick="navigate('transactions')">View All →</button>
        </div>
        <div id="portTxnWrap"></div>
      </div>`;

    // Draw donut
    if (holdings.length > 0) {
      const colors = ['#00E5A0','#7B61FF','#F5C842','#FF6B35','#378ADD','#6B7280'];
      setTimeout(() => {
        Charts.donut(
          'portDonut',
          holdings.map(h => h.symbol),
          holdings.map(h => h.currentValue),
          holdings.map((_, i) => colors[i % colors.length])
        );
      }, 80);
    }

    // Load recent transactions
    this.loadRecentTxns();
  },

  async loadRecentTxns() {
    const wrap = document.getElementById('portTxnWrap');
    if (!wrap) return;
    const res = await Api.transactions('limit=5');
    if (!res.success || !res.data.length) {
      wrap.innerHTML = `<div style="text-align:center;padding:30px;color:var(--muted);background:var(--card);border:1px solid var(--border);border-radius:12px">No transactions yet</div>`;
      return;
    }
    wrap.innerHTML = this.txnTableHTML(res.data);
  },

  txnTableHTML(txns) {
    return `<div style="background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;overflow-x:auto">
      <table class="txn-table">
        <thead><tr><th>Type</th><th>Asset</th><th>Qty</th><th>Price</th><th>Total</th><th>P&L</th><th>Date</th></tr></thead>
        <tbody>
          ${txns.map(t => {
            const pnlUp = (t.profitLoss || 0) >= 0;
            const date = new Date(t.createdAt);
            return `<tr>
              <td><span class="txn-type-badge ${t.type}">${t.type.toUpperCase()}</span></td>
              <td style="font-weight:500">${t.symbol || '—'}</td>
              <td style="font-family:'DM Mono',monospace">${t.quantity || '—'}</td>
              <td style="font-family:'DM Mono',monospace">${t.price ? '₹'+t.price.toLocaleString('en-IN') : '—'}</td>
              <td style="font-family:'DM Mono',monospace">₹${t.totalAmount.toLocaleString('en-IN')}</td>
              <td class="${t.profitLoss ? (pnlUp?'up':'down') : 'muted'}" style="font-family:'DM Mono',monospace;font-size:12px">
                ${t.type === 'sell' ? (pnlUp?'+':'')+'₹'+(t.profitLoss||0).toLocaleString('en-IN') : '—'}
              </td>
              <td style="color:var(--muted);font-size:11px">${date.toLocaleDateString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>`;
  },

  // Dashboard sidebar panel
  async loadDash() {
    const wrap = document.getElementById('dashPortfolioContent');
    if (!wrap || !App.user) return;
    const res = await Api.portfolio();
    if (!res.success) return;
    const { summary, holdings } = res.data;
    const pnlUp = summary.totalPnl >= 0;
    const colors = ['#00E5A0','#7B61FF','#F5C842','#FF6B35','#378ADD','#6B7280'];

    wrap.innerHTML = `
      <div class="port-summary">
        <div class="ps-total-label">Total Value</div>
        <div class="ps-total">₹${summary.currentValue.toLocaleString('en-IN')}</div>
        <div class="ps-pnl ${pnlUp?'up':'down'}">${pnlUp?'▲':'▼'} ${pnlUp?'+':''}₹${summary.totalPnl.toLocaleString('en-IN')} (${Math.abs(summary.totalPnlPct).toFixed(2)}%)</div>
      </div>
      <div class="port-donut-wrap"><canvas id="dashDonut" role="img" aria-label="Dashboard portfolio donut"></canvas></div>
      <div class="port-holdings-list">
        ${holdings.slice(0,5).map((h,i) => `
          <div class="ph-row">
            <div class="ph-left">
              <div class="ph-dot" style="background:${colors[i%colors.length]}"></div>
              <span class="ph-name">${h.name}</span>
            </div>
            <div class="ph-right">
              <div class="ph-val">₹${h.currentValue.toLocaleString('en-IN')}</div>
              <div class="ph-pct ${h.pnl>=0?'up':'down'}" style="font-size:10px">${h.pnl>=0?'+':''}${h.pnlPct.toFixed(2)}%</div>
            </div>
          </div>`).join('')}
        ${holdings.length === 0 ? `<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">No holdings. <a href="#" onclick="navigate('market')" style="color:var(--accent)">Start trading →</a></div>` : ''}
      </div>
      <button class="btn-outline btn-full" style="margin-top:16px;font-size:13px" onclick="openDepositModal()">+ Add Funds</button>`;

    if (holdings.length > 0) {
      setTimeout(() => {
        Charts.donut('dashDonut', holdings.map(h => h.symbol), holdings.map(h => h.currentValue), holdings.map((_,i) => colors[i%colors.length]));
      }, 80);
    }
  },

  // Transactions page
  async loadTransactions() {
    const wrap = document.getElementById('txnContent');
    if (!wrap) return;
    if (!App.user) {
      wrap.innerHTML = `<div class="login-prompt-full"><h3>Please login to view transactions</h3><button class="btn-primary" onclick="navigate('login')">Login</button></div>`;
      return;
    }
    wrap.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted)">Loading...</div>';
    const q = this.txnFilter !== 'all' ? `type=${this.txnFilter}` : '';
    const res = await Api.transactions(q);
    if (!res.success) { wrap.innerHTML = `<div class="login-prompt-full"><h3>${res.message}</h3></div>`; return; }
    wrap.innerHTML = `<div class="txn-wrap">${res.data.length ? this.txnTableHTML(res.data) : '<div style="text-align:center;padding:60px;color:var(--muted);background:var(--card);border:1px solid var(--border);border-radius:14px">No transactions found</div>'}</div>`;
  }
};

function setTxnFilter(filter, btn) {
  document.querySelectorAll('.txn-controls .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  Portfolio.txnFilter = filter;
  Portfolio.loadTransactions();
}
