const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// GET /api/transactions
router.get('/', protect, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    let where = { userId: req.user.id };

    if (type && type !== 'all') {
      where.type = type;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
