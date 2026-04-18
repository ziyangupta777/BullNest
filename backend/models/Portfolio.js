const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Portfolio = sequelize.define('Portfolio', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('stock', 'crypto'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  avgBuyPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  totalInvested: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  logoColor: {
    type: DataTypes.STRING,
    defaultValue: '#00E5A0'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'symbol']
    }
  ]
});

module.exports = Portfolio;
