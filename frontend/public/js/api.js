// =============================================
// API.JS — All backend communication
// =============================================

const API_BASE = '/api';

const Api = {
  token: localStorage.getItem('bn_token') || null,

  setToken(t) {
    this.token = t;
    if (t) localStorage.setItem('bn_token', t);
    else localStorage.removeItem('bn_token');
  },

  headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  },

  async request(method, path, body) {
    try {
      const opts = { method, headers: this.headers() };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(API_BASE + path, opts);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API Error:', err);
      return { success: false, message: 'Network error. Is the server running?' };
    }
  },

  get(path)         { return this.request('GET', path); },
  post(path, body)  { return this.request('POST', path, body); },
  put(path, body)   { return this.request('PUT', path, body); },
  del(path)         { return this.request('DELETE', path); },

  // Auth
  register(data)    { return this.post('/auth/register', data); },
  login(data)       { return this.post('/auth/login', data); },
  me()              { return this.get('/auth/me'); },

  // Market
  stocks(q)         { return this.get('/market/stocks' + (q ? '?' + q : '')); },
  crypto(q)         { return this.get('/market/crypto' + (q ? '?' + q : '')); },
  allAssets()       { return this.get('/market/all'); },
  asset(sym)        { return this.get('/market/asset/' + sym); },

  // Trade
  buy(sym, qty)     { return this.post('/trade/buy', { symbol: sym, quantity: qty }); },
  sell(sym, qty)    { return this.post('/trade/sell', { symbol: sym, quantity: qty }); },
  deposit(amt)      { return this.post('/trade/deposit', { amount: amt }); },

  // Portfolio
  portfolio()       { return this.get('/portfolio'); },

  // Transactions
  transactions(f)   { return this.get('/transactions' + (f ? '?' + f : '')); },

  // User
  profile()         { return this.get('/user/profile'); },

  // Admin
  adminStats()      { return this.get('/admin/stats'); },
  adminUsers()      { return this.get('/admin/users'); },
  adminTxns()       { return this.get('/admin/transactions'); },
};
