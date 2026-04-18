# 🐂 BullNest – India's Smart Market Hub
**Full-Stack Trading Simulation Platform**

> Built by **Ziyan Gupta** | Contact: +91 63596 62010 | ziyan@bullnest.in

---

## 🚀 Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Charts | Chart.js 4.4 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io |

---

## 📁 Project Structure
```
bullnest/
├── backend/
│   ├── config/
│   │   └── seed.js           ← Database seeder (15 stocks + 10 cryptos)
│   ├── middleware/
│   │   └── auth.js           ← JWT protect + adminOnly middleware
│   ├── models/
│   │   ├── User.js           ← User schema (wallet, bcrypt)
│   │   ├── Asset.js          ← Stock/Crypto schema
│   │   ├── Portfolio.js      ← Holdings per user
│   │   └── Transaction.js    ← Buy/Sell/Deposit history
│   ├── routes/
│   │   ├── auth.js           ← POST /register, POST /login, GET /me
│   │   ├── user.js           ← GET/PUT /profile
│   │   ├── market.js         ← GET /stocks, /crypto, /all, /asset/:sym
│   │   ├── trade.js          ← POST /buy, /sell, /deposit
│   │   ├── portfolio.js      ← GET /portfolio (with live P&L)
│   │   ├── transactions.js   ← GET /transactions
│   │   └── admin.js          ← Admin: users, trades, stats
│   ├── server.js             ← Express + Socket.io server
│   ├── package.json
│   └── .env                  ← Environment variables
└── frontend/
    └── public/
        ├── index.html        ← Single-page app entry
        ├── css/
        │   └── main.css      ← Complete dark-theme styles
        └── js/
            ├── api.js        ← All API fetch calls
            ├── charts.js     ← Chart.js wrappers
            ├── market.js     ← Market page + buy/sell modal
            ├── portfolio.js  ← Portfolio + transactions pages
            ├── admin.js      ← Admin panel
            └── app.js        ← Routing, auth, socket, boot
```

---

## ⚙️ Local Setup (Step by Step)

### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Community → https://www.mongodb.com/try/download/community
- Git (optional)

### 1. Start MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Windows — start MongoDB service from Services app
# OR run: mongod --dbpath C:\data\db

# Linux
sudo systemctl start mongod
```

### 2. Clone / extract project
```bash
cd ~/Desktop
# If you have git:
# git clone <repo>
# cd bullnest
```

### 3. Install backend dependencies
```bash
cd bullnest/backend
npm install
```

### 4. Configure environment
Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bullnest
JWT_SECRET=bullnest_super_secret_jwt_key_2025
NODE_ENV=development
```

### 5. Seed the database
```bash
npm run seed
```
This creates:
- **15 NSE stocks** (Reliance, TCS, HDFC, Infosys, etc.)
- **10 Cryptocurrencies** (BTC, ETH, SOL, DOGE, etc.)
- **Admin account**: admin@bullnest.in / Admin@123
- **Demo account**: demo@bullnest.in / Demo@123

### 6. Start the server
```bash
npm run dev        # Development (nodemon, auto-restart)
# OR
npm start          # Production
```

### 7. Open in browser
```
http://localhost:5000
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Register user | No |
| POST | /api/auth/login | Login user | No |
| GET | /api/auth/me | Get current user | Yes |

### Market
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/market/all | All assets | No |
| GET | /api/market/stocks | Stocks only | No |
| GET | /api/market/crypto | Crypto only | No |
| GET | /api/market/asset/:symbol | Single asset | No |

### Trading
| Method | Endpoint | Body | Auth |
|---|---|---|---|
| POST | /api/trade/buy | `{symbol, quantity}` | Yes |
| POST | /api/trade/sell | `{symbol, quantity}` | Yes |
| POST | /api/trade/deposit | `{amount}` | Yes |

### Portfolio & Transactions
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/portfolio | Holdings + live P&L | Yes |
| GET | /api/transactions | Trade history | Yes |

### Admin
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/admin/stats | Platform stats | Admin |
| GET | /api/admin/users | All users | Admin |
| GET | /api/admin/transactions | All trades | Admin |

---

## 🔥 Features

### Trading System
- ✅ Buy stocks & crypto with wallet balance
- ✅ Sell and get profit/loss calculation
- ✅ Portfolio tracks avg buy price
- ✅ Real-time P&L updates via Socket.io
- ✅ Insufficient balance protection
- ✅ Invalid quantity validation

### Real-time
- ✅ Socket.io pushes price updates every 3 seconds
- ✅ Live ticker bar scrolling all assets
- ✅ Market table prices update in real-time (flash animation)
- ✅ Main stock chart appends new data points live

### Auth & Security
- ✅ Passwords hashed with bcryptjs (salt rounds: 12)
- ✅ JWT tokens (30-day expiry)
- ✅ Protected routes middleware
- ✅ Admin-only routes

### Pages
- ✅ Dashboard — Hero, market movers, chart, portfolio summary, news
- ✅ Login / Register — JWT auth
- ✅ Market — Full table with search, filter, sort
- ✅ Portfolio — Holdings table, donut chart, P&L summary
- ✅ Transactions — Full history with filter
- ✅ Admin — User list, trade log, platform stats

---

## 🚢 Deployment (Railway / Render)

### Option A: Railway
```bash
npm install -g railway
railway login
railway init
railway add mongodb
railway deploy
```

### Option B: Render
1. Push to GitHub
2. Go to render.com → New Web Service
3. Connect repo, set:
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`
4. Add Environment Variables from `.env`
5. Add MongoDB Atlas URI as `MONGO_URI`

### MongoDB Atlas (Cloud DB)
1. Go to cloud.mongodb.com
2. Create free M0 cluster
3. Get connection string
4. Replace `MONGO_URI` in `.env`:
   ```
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/bullnest
   ```
5. Run `npm run seed` once

---

## 🔑 Test Accounts
| Role | Email | Password | Balance |
|---|---|---|---|
| Admin | admin@bullnest.in | Admin@123 | ₹1,00,00,000 |
| Demo | demo@bullnest.in | Demo@123 | ₹5,00,000 |
| New User | (register) | (any 6+ chars) | ₹1,00,000 |

---

## 📞 Contact
**Ziyan Gupta** – Founder & CEO, BullNest Technologies
- 📞 +91 63596 62010
- ✉️ ziyan@bullnest.in
- 📍 Ahmedabad, Gujarat, India

---
*BullNest is a college project. Paper trading only. No real money involved.*
