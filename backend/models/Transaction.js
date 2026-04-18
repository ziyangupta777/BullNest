const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('buy', 'sell', 'deposit', 'withdrawal'),
    allowNull: false
  },
  symbol: {
    type: DataTypes.STRING
  },
  name: {
    type: DataTypes.STRING
  },
  assetType: {
    type: DataTypes.ENUM('stock', 'crypto', 'wallet'),
    defaultValue: 'wallet'
  },
  quantity: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  price: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('completed', 'pending', 'failed'),
    defaultValue: 'completed'
  },
  profitLoss: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
});

module.exports = Transaction;
