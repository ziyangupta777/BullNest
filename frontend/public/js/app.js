// =============================================
// APP.JS — Core app: routing, auth, socket, UI
// =============================================

const App = {
  user: null,
  socket: null,

  async init() {
    // Try to restore session
    const token = localStorage.getItem('bn_token');
    if (token) {
      Api.setToken(token);
      const res = await Api.me();
      if (res.success) {
        this.user = res.user;
        this.onLogin(res.user, false);
      } else {
        Api.setToken(null);
      }
    }

    // Setup socket
    this.initSocket();

    // Fetch market data
    await Market.init();

    // Hero chart
    Charts.hero('heroChart');

    // News
    this.renderNews();

    // Route based on hash or default
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigate(hash, false);
  },

  initSocket() {
    try {
      this.socket = io();
      this.socket.on('price_update', (updates) => {
        Market.updatePrices(updates);
      });
      this.socket.on('connect', () => console.log('🟢 Socket connected'));
      this.socket.on('disconnect', () => console.log('🔴 Socket disconnected'));
    } catch (e) {
      console.warn('Socket.io not available:', e.message);
    }
  },

  onLogin(user, showToast = true) {
    this.user = user;
    // Update UI
    document.getElementById('authButtons').classList.add('hidden');
    document.getElementById('userMenu').classList.remove('hidden');
    document.getElementById('walletBadge').classList.remove('hidden');
    document.getElementById('userName').textContent = user.name.split(' ')[0];
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    this.updateNavBalance();
    // Show admin link if admin
    if (user.isAdmin) {
      document.querySelectorAll('.admin-link').forEach(el => el.classList.remove('hidden'));
    }
    // Update hero buttons
    const hb = document.getElementById('heroBtns');
    if (hb) hb.innerHTML = `
      <button class="btn-primary btn-lg" onclick="navigate('market')">Trade Now</button>
      <button class="btn-outline btn-lg" onclick="openDepositModal()">Add Funds</button>`;
    if (showToast) this.showToast(`Welcome back, ${user.name.split(' ')[0]}! 🚀`, 'success');
  },

  updateNavBalance() {
    const el = document.getElementById('navBalance');
    if (el && this.user) {
      el.textContent = '₹' + (this.user.walletBalance || 0).toLocaleString('en-IN');
    }
  },

  showLoading(show) {
    document.getElementById('loading-overlay').classList.toggle('hidden', !show);
  },

  showToast(msg, type = 'info') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    t.innerHTML = `<span style="font-size:16px">${icon}</span><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300); }, 4000);
  },

  renderNews() {
    const newsData = [
      { tag: 'Earnings', headline: 'Reliance Industries Q4 PAT jumps 18% YoY; Jio remains key growth driver', time: '2h ago' },
      { tag: 'Crypto', headline: 'Bitcoin crosses ₹70 lakh for the first time in 2025 amid global rally', time: '3h ago' },
      { tag: 'IPO', headline: 'Ola Electric IPO oversubscribed 4.8x on Day 1; retail portion fully booked', time: '4h ago' },
      { tag: 'Economy', headline: 'RBI keeps repo rate unchanged at 6.5%; governor signals wait-and-watch mode', time: '5h ago' },
      { tag: 'Markets', headline: 'FIIs net buyers of ₹6,400 crore in Indian equities; DIIs also stay positive', time: '6h ago' },
      { tag: 'IT Sector', headline: 'Nifty IT surges 2.4% as TCS & Infosys post strong Q4 deal wins', time: '7h ago' },
    ];
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    grid.innerHTML = newsData.map(n => `
      <div class="news-card">
        <div class="news-tag">${n.tag}</div>
        <div class="news-headline">${n.headline}</div>
        <div class="news-meta">${n.time} · BullNest News Desk</div>
      </div>`).join('');
  }
};

// =============================================
// ROUTING
// =============================================
function navigate(page, pushState = true) {
  const pages = ['dashboard','login','register','market','portfolio','transactions','admin'];
  if (!pages.includes(page)) page = 'dashboard';

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });

  // Update hash
  if (pushState) window.history.pushState({}, '', '#' + page);

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');

  // Page-specific actions
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'portfolio') Portfolio.load();
  if (page === 'transactions') Portfolio.loadTransactions();
  if (page === 'admin') Admin.load();
  if (page === 'dashboard' && App.user) Portfolio.loadDash();
  if (page === 'market') Market.renderMarketTable();
}

// Back/forward nav
window.addEventListener('popstate', () => {
  const page = window.location.hash.replace('#','') || 'dashboard';
  navigate(page, false);
});

// Nav link clicks
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(link.dataset.page);
  });
});

// =============================================
// AUTH ACTIONS
// =============================================
async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { App.showToast('Please enter email and password', 'error'); return; }
  App.showLoading(true);
  const res = await Api.login({ email, password });
  App.showLoading(false);
  if (res.success) {
    Api.setToken(res.token);
    App.onLogin(res.user);
    navigate('dashboard');
  } else {
    App.showToast(res.message || 'Login failed', 'error');
  }
}

async function doRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  if (!name || !email || !password) { App.showToast('Please fill all required fields', 'error'); return; }
  if (password.length < 6) { App.showToast('Password must be at least 6 characters', 'error'); return; }
  App.showLoading(true);
  const res = await Api.register({ name, email, phone, password });
  App.showLoading(false);
  if (res.success) {
    Api.setToken(res.token);
    App.onLogin(res.user);
    navigate('dashboard');
  } else {
    App.showToast(res.message || 'Registration failed', 'error');
  }
}

function quickLogin(type) {
  document.getElementById('loginEmail').value = type === 'demo' ? 'demo@bullnest.in' : 'admin@bullnest.in';
  document.getElementById('loginPassword').value = type === 'demo' ? 'Demo@123' : 'Admin@123';
  doLogin();
}

function logout() {
  Api.setToken(null);
  App.user = null;
  document.getElementById('authButtons').classList.remove('hidden');
  document.getElementById('userMenu').classList.add('hidden');
  document.getElementById('walletBadge').classList.add('hidden');
  document.querySelectorAll('.admin-link').forEach(el => el.classList.add('hidden'));
  const hb = document.getElementById('heroBtns');
  if (hb) hb.innerHTML = `
    <button class="btn-primary btn-lg" onclick="navigate('register')">Start Investing Free</button>
    <button class="btn-outline btn-lg" onclick="navigate('market')">Explore Markets</button>`;
  App.showToast('Logged out successfully', 'info');
  navigate('dashboard');
}

// =============================================
// DEPOSIT MODAL
// =============================================
function openDepositModal() {
  if (!App.user) { navigate('login'); return; }
  const box = document.getElementById('modal-box');
  box.innerHTML = `
    <div class="modal-title">💳 Add Funds</div>
    <div class="modal-sub">Add virtual money to your BullNest wallet</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px">
      ${[10000,25000,50000,100000,250000,500000].map(amt => `
        <button onclick="setDepositAmt(${amt})" class="btn-outline" style="font-size:12px;padding:8px 4px;text-align:center">₹${amt.toLocaleString('en-IN')}</button>
      `).join('')}
    </div>
    <div class="form-group">
      <label>Custom Amount</label>
      <input type="number" id="depositAmt" placeholder="Enter amount" min="1" max="10000000" />
    </div>
    <div class="modal-actions">
      <button class="btn-outline" style="flex:1" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" style="flex:2" onclick="doDeposit()">Add to Wallet</button>
    </div>`;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('depositAmt').focus();
}

function setDepositAmt(amt) {
  document.getElementById('depositAmt').value = amt;
}

async function doDeposit() {
  const amt = parseFloat(document.getElementById('depositAmt').value);
  if (!amt || amt <= 0) { App.showToast('Enter a valid amount', 'error'); return; }
  App.showLoading(true);
  const res = await Api.deposit(amt);
  App.showLoading(false);
  if (res.success) {
    closeModal();
    App.user.walletBalance = res.newBalance;
    App.updateNavBalance();
    App.showToast(res.message, 'success');
  } else {
    App.showToast(res.message, 'error');
  }
}

// =============================================
// MOBILE MENU
// =============================================
function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// Enter key on auth forms
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  if (document.getElementById('page-login').classList.contains('active')) doLogin();
  if (document.getElementById('page-register').classList.contains('active')) doRegister();
  if (!document.getElementById('modal-overlay').classList.contains('hidden')) {
    const depBtn = document.querySelector('#modal-box .btn-primary');
    if (depBtn && document.getElementById('depositAmt') === document.activeElement) doDeposit();
  }
});

// =============================================
// BOOT
// =============================================
window.addEventListener('DOMContentLoaded', () => App.init());
