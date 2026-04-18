const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const { Op } = require('sequelize');

// GET /api/market/stocks
router.get('/stocks', async (req, res) => {
  try {
    const { search, sort = 'name', order = 'asc' } = req.query;
    let where = { type: 'stock' };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { symbol: { [Op.like]: `%${search}%` } }
      ];
    }

    const stocks = await Asset.findAll({
      where,
      order: [[sort, order.toUpperCase()]]
    });
    res.json({ success: true, data: stocks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/market/crypto
router.get('/crypto', async (req, res) => {
  try {
    const { search, sort = 'marketCap', order = 'desc' } = req.query;
    let where = { type: 'crypto' };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { symbol: { [Op.like]: `%${search}%` } }
      ];
    }

    const crypto = await Asset.findAll({
      where,
      order: [[sort, order.toUpperCase()]]
    });
    res.json({ success: true, data: crypto });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/market/all
router.get('/all', async (req, res) => {
  try {
    const assets = await Asset.findAll({});
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/market/asset/:symbol
router.get('/asset/:symbol', async (req, res) => {
  try {
    const asset = await Asset.findOne({ 
      where: { symbol: req.params.symbol.toUpperCase() } 
    });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
