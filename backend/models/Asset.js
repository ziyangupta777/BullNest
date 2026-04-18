const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('stock', 'crypto'),
    allowNull: false
  },
  currentPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  openPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  high24h: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  low24h: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  change24h: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  volume: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  marketCap: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  sector: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  logoColor: {
    type: DataTypes.STRING,
    defaultValue: '#00E5A0'
  }
});

module.exports = Asset;
