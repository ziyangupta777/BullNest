const User = require('./User');
const Asset = require('./Asset');
const Portfolio = require('./Portfolio');
const Transaction = require('./Transaction');

// Associations
User.hasMany(Portfolio, { foreignKey: 'userId' });
Portfolio.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Asset,
  Portfolio,
  Transaction
};
