const sequelize = require('./database');
const { User, Asset } = require('../models');
const dotenv = require('dotenv');
dotenv.config();

const stocks = [
  { name: 'Reliance Industries', symbol: 'RELIANCE', type: 'stock', currentPrice: 2934, openPrice: 2890, high24h: 2960, low24h: 2870, change24h: 1.52, volume: 8234567, marketCap: 1985000000000, sector: 'Energy & Petrochemicals', logoColor: '#FF6B35' },
  { name: 'Tata Consultancy Services', symbol: 'TCS', type: 'stock', currentPrice: 3812, openPrice: 3795, high24h: 3845, low24h: 3780, change24h: 0.45, volume: 2345678, marketCap: 1392000000000, sector: 'Information Technology', logoColor: '#00E5A0' },
  { name: 'HDFC Bank', symbol: 'HDFCBANK', type: 'stock', currentPrice: 1622, openPrice: 1640, high24h: 1648, low24h: 1608, change24h: -1.10, volume: 5678901, marketCap: 1234000000000, sector: 'Banking & Finance', logoColor: '#7B61FF' },
  { name: 'Infosys', symbol: 'INFY', type: 'stock', currentPrice: 1478, openPrice: 1445, high24h: 1490, low24h: 1440, change24h: 2.28, volume: 4567890, marketCap: 614000000000, sector: 'Information Technology', logoColor: '#F5C842' },
  { name: 'State Bank of India', symbol: 'SBIN', type: 'stock', currentPrice: 734, openPrice: 724, high24h: 740, low24h: 720, change24h: 1.38, volume: 12345678, marketCap: 655000000000, sector: 'Banking & Finance', logoColor: '#378ADD' },
  { name: 'Bajaj Finance', symbol: 'BAJFINANCE', type: 'stock', currentPrice: 7234, openPrice: 7150, high24h: 7290, low24h: 7100, change24h: 1.17, volume: 987654, marketCap: 437000000000, sector: 'NBFC', logoColor: '#00E5A0' },
  { name: 'Tata Motors', symbol: 'TATAMOTORS', type: 'stock', currentPrice: 954, openPrice: 938, high24h: 968, low24h: 930, change24h: 1.71, volume: 6789012, marketCap: 353000000000, sector: 'Automobile', logoColor: '#FF4757' },
  { name: 'Maruti Suzuki', symbol: 'MARUTI', type: 'stock', currentPrice: 12841, openPrice: 12700, high24h: 12900, low24h: 12680, change24h: 1.11, volume: 345678, marketCap: 388000000000, sector: 'Automobile', logoColor: '#F5C842' },
  { name: 'ICICI Bank', symbol: 'ICICIBANK', type: 'stock', currentPrice: 1087, openPrice: 1075, high24h: 1096, low24h: 1068, change24h: 1.12, volume: 7890123, marketCap: 764000000000, sector: 'Banking & Finance', logoColor: '#FF6B35' },
  { name: 'Wipro', symbol: 'WIPRO', type: 'stock', currentPrice: 479, openPrice: 470, high24h: 485, low24h: 468, change24h: 1.91, volume: 3456789, marketCap: 248000000000, sector: 'Information Technology', logoColor: '#7B61FF' },
  { name: 'HCL Technologies', symbol: 'HCLTECH', type: 'stock', currentPrice: 1587, openPrice: 1564, high24h: 1600, low24h: 1555, change24h: 1.47, volume: 2345678, marketCap: 430000000000, sector: 'Information Technology', logoColor: '#00E5A0' },
  { name: 'Adani Enterprises', symbol: 'ADANIENT', type: 'stock', currentPrice: 2847, openPrice: 2715, high24h: 2870, low24h: 2700, change24h: 4.86, volume: 4567890, marketCap: 324000000000, sector: 'Conglomerate', logoColor: '#FF6B35' },
  { name: 'UltraTech Cement', symbol: 'ULTRACEMCO', type: 'stock', currentPrice: 10342, openPrice: 10200, high24h: 10400, low24h: 10150, change24h: 1.39, volume: 234567, marketCap: 298000000000, sector: 'Construction Materials', logoColor: '#F5C842' },
  { name: 'ONGC', symbol: 'ONGC', type: 'stock', currentPrice: 267, openPrice: 262, high24h: 270, low24h: 260, change24h: 1.91, volume: 15678901, marketCap: 336000000000, sector: 'Oil & Gas', logoColor: '#378ADD' },
  { name: 'Sun Pharma', symbol: 'SUNPHARMA', type: 'stock', currentPrice: 1623, openPrice: 1598, high24h: 1640, low24h: 1590, change24h: 1.56, volume: 2345678, marketCap: 389000000000, sector: 'Pharmaceuticals', logoColor: '#00C896' },
];

const cryptos = [
  { name: 'Bitcoin', symbol: 'BTC', type: 'crypto', currentPrice: 6941200, openPrice: 6720000, high24h: 7050000, low24h: 6680000, change24h: 3.29, volume: 234567890, marketCap: 136000000000000, sector: 'Layer 1', logoColor: '#F5C842' },
  { name: 'Ethereum', symbol: 'ETH', type: 'crypto', currentPrice: 321800, openPrice: 307000, high24h: 328000, low24h: 305000, change24h: 4.82, volume: 145678901, marketCap: 38700000000000, sector: 'Layer 1', logoColor: '#7B61FF' },
  { name: 'BNB', symbol: 'BNB', type: 'crypto', currentPrice: 52340, openPrice: 51200, high24h: 53100, low24h: 50800, change24h: 2.23, volume: 12345678, marketCap: 7840000000000, sector: 'Exchange Token', logoColor: '#F5C842' },
  { name: 'Solana', symbol: 'SOL', type: 'crypto', currentPrice: 12780, openPrice: 12020, high24h: 13100, low24h: 11980, change24h: 6.32, volume: 56789012, marketCap: 5900000000000, sector: 'Layer 1', logoColor: '#00E5A0' },
  { name: 'XRP', symbol: 'XRP', type: 'crypto', currentPrice: 512, openPrice: 519, high24h: 525, low24h: 505, change24h: -1.35, volume: 234567890, marketCap: 2900000000000, sector: 'Payments', logoColor: '#6B7280' },
  { name: 'Dogecoin', symbol: 'DOGE', type: 'crypto', currentPrice: 1480, openPrice: 1369, high24h: 1520, low24h: 1350, change24h: 8.10, volume: 123456789, marketCap: 2100000000000, sector: 'Meme Coin', logoColor: '#FF6B35' },
  { name: 'Polygon', symbol: 'MATIC', type: 'crypto', currentPrice: 7340, openPrice: 6950, high24h: 7500, low24h: 6900, change24h: 5.61, volume: 45678901, marketCap: 680000000000, sector: 'Layer 2', logoColor: '#7B61FF' },
  { name: 'Cardano', symbol: 'ADA', type: 'crypto', currentPrice: 3860, openPrice: 3894, high24h: 3950, low24h: 3800, change24h: -0.87, volume: 34567890, marketCap: 1360000000000, sector: 'Layer 1', logoColor: '#378ADD' },
  { name: 'Avalanche', symbol: 'AVAX', type: 'crypto', currentPrice: 3250, openPrice: 3100, high24h: 3310, low24h: 3080, change24h: 4.84, volume: 23456789, marketCap: 1330000000000, sector: 'Layer 1', logoColor: '#FF4757' },
  { name: 'Chainlink', symbol: 'LINK', type: 'crypto', currentPrice: 1248, openPrice: 1196, high24h: 1270, low24h: 1185, change24h: 4.35, volume: 12345678, marketCap: 780000000000, sector: 'Oracle', logoColor: '#378ADD' },
];

const seedDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to SQLite');

    await sequelize.sync({ force: true });
    console.log('Database synced (force: true)');

    // Insert new assets
    const allAssets = [...stocks, ...cryptos];
    await Asset.bulkCreate(allAssets);
    console.log(`✅ Seeded ${allAssets.length} assets`);

    // Create admin user
    await User.create({
      name: 'Ziyan Gupta',
      email: 'admin@bullnest.in',
      password: 'Admin@123',
      walletBalance: 10000000,
      isAdmin: true,
      phone: '+91 63596 62010'
    });
    console.log('✅ Admin user created: admin@bullnest.in / Admin@123');

    // Create demo user
    await User.create({
      name: 'Demo Investor',
      email: 'demo@bullnest.in',
      password: 'Demo@123',
      walletBalance: 500000
    });
    console.log('✅ Demo user created: demo@bullnest.in / Demo@123');

    console.log('\n🚀 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
