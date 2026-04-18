const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/market', require('./routes/market'));
app.use('/api/trade', require('./routes/trade'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/admin', require('./routes/admin'));

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Database Sync & Initial Load
const sequelize = require('./config/database');
const Asset = require('./models/Asset');
const User = require('./models/User');
const Portfolio = require('./models/Portfolio');
const Transaction = require('./models/Transaction');

sequelize.sync()
  .then(() => console.log('✅ SQLite Database Connected & Synced'))
  .catch(err => console.error('❌ Database Error:', err));

// Socket.io – Live Price Simulation
const simulatePrices = async () => {
  try {
    const assets = await Asset.findAll();
    const updates = [];

    for (const asset of assets) {
      const change = (Math.random() - 0.48) * 0.02; // -1% to +1%
      const newPrice = parseFloat((asset.currentPrice * (1 + change)).toFixed(2));
      const prevPrice = asset.currentPrice;
      const newChange24h = parseFloat(((newPrice - asset.openPrice) / asset.openPrice * 100).toFixed(2));

      await asset.update({
        currentPrice: newPrice,
        change24h: newChange24h
      });

      updates.push({
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        currentPrice: newPrice,
        prevPrice,
        change24h: newChange24h,
        volume: asset.volume
      });
    }

    io.emit('price_update', updates);
  } catch (err) {
    console.error('Price simulation error:', err.message);
  }
};

io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);

  // Send current prices on connect
  Asset.findAll().then(assets => {
    socket.emit('price_update', assets.map(a => ({
      symbol: a.symbol,
      name: a.name,
      type: a.type,
      currentPrice: a.currentPrice,
      change24h: a.change24h,
      volume: a.volume
    })));
  });

  socket.on('disconnect', () => {
    console.log('📡 Client disconnected:', socket.id);
  });
});

// Start price simulation every 3 seconds
setInterval(simulatePrices, 3000);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 BullNest server running on port ${PORT}`);
});

module.exports = { io };
