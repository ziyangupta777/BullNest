const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { User, Transaction, Asset, Portfolio } = require('../models');
const { Op } = require('sequelize');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 200
    });
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalTrades = await Transaction.count({ 
      where: { type: { [Op.in]: ['buy', 'sell'] } } 
    });
    const totalDeposits = await Transaction.sum('totalAmount', { 
      where: { type: 'deposit' } 
    }) || 0;
    const totalVolume = await Transaction.sum('totalAmount', { 
      where: { type: { [Op.in]: ['buy', 'sell'] } } 
    }) || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTrades,
        totalDeposits,
        totalVolume
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/asset/:id
router.put('/asset/:id', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    await asset.update(req.body);
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/user/:id
router.delete('/user/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.destroy();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
