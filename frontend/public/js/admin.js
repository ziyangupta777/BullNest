// =============================================
// ADMIN.JS — Admin panel
// =============================================

const Admin = {
  async load() {
    const wrap = document.getElementById('adminContent');
    if (!wrap) return;
    if (!App.user || !App.user.isAdmin) {
      wrap.innerHTML = `<div class="login-prompt-full"><h3 style="color:var(--down)">Access Denied — Admin only</h3></div>`;
      return;
    }
    wrap.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted)">Loading admin data...</div>';

    const [statsRes, usersRes, txnsRes] = await Promise.all([
      Api.adminStats(), Api.adminUsers(), Api.adminTxns()
    ]);

    if (!statsRes.success) {
      wrap.innerHTML = `<div class="login-prompt-full"><h3>${statsRes.message}</h3></div>`;
      return;
    }

    const s = statsRes.data;
    const users = usersRes.data || [];
    const txns = txnsRes.data || [];

    wrap.innerHTML = `
      <div class="admin-wrap">
        <div class="admin-stats">
          <div class="psc"><div class="psc-label">Total Users</div><div class="psc-val">${s.totalUsers}</div></div>
          <div class="psc"><div class="psc-label">Total Trades</div><div class="psc-val">${s.totalTrades}</div></div>
          <div class="psc"><div class="psc-label">Total Deposits</div><div class="psc-val up">₹${(s.totalDeposits||0).toLocaleString('en-IN')}</div></div>
          <div class="psc"><div class="psc-label">Trade Volume</div><div class="psc-val gold">₹${(s.totalVolume||0).toLocaleString('en-IN')}</div></div>
        </div>

        <div class="admin-section-title">All Users (${users.length})</div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Balance</th><th>Admin</th><th>Joined</th></tr></thead>
            <tbody>
              ${users.map((u, i) => `<tr>
                <td style="color:var(--muted)">${i+1}</td>
                <td style="font-weight:500">${u.name}</td>
                <td style="color:var(--muted)">${u.email}</td>
                <td style="font-family:'DM Mono',monospace;color:var(--accent)">₹${(u.walletBalance||0).toLocaleString('en-IN')}</td>
                <td><span class="admin-badge ${u.isAdmin?'yes':'no'}">${u.isAdmin?'Admin':'User'}</span></td>
                <td style="color:var(--muted);font-size:11px">${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="admin-section-title">Recent Transactions (${txns.length})</div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>User</th><th>Type</th><th>Asset</th><th>Qty</th><th>Amount</th><th>P&L</th><th>Date</th></tr></thead>
            <tbody>
              ${txns.slice(0,50).map(t => {
                const pnlUp = (t.profitLoss||0) >= 0;
                return `<tr>
                  <td style="font-size:12px">${t.userId?.name || 'Unknown'}<br><span style="color:var(--muted);font-size:10px">${t.userId?.email||''}</span></td>
                  <td><span class="txn-type-badge ${t.type}">${t.type.toUpperCase()}</span></td>
                  <td style="font-weight:500;font-family:'DM Mono',monospace">${t.symbol||'—'}</td>
                  <td style="font-family:'DM Mono',monospace">${t.quantity||'—'}</td>
                  <td style="font-family:'DM Mono',monospace">₹${t.totalAmount.toLocaleString('en-IN')}</td>
                  <td class="${t.type==='sell'?(pnlUp?'up':'down'):'muted'}" style="font-family:'DM Mono',monospace;font-size:11px">
                    ${t.type==='sell' ? (pnlUp?'+':'')+'₹'+(t.profitLoss||0).toLocaleString('en-IN') : '—'}
                  </td>
                  <td style="color:var(--muted);font-size:10px">${new Date(t.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }
};
