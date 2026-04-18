const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const Asset = require('../models/Asset');

// GET /api/portfolio
router.get('/', protect, async (req, res) => {
  try {
    const holdings = await Portfolio.findAll({ where: { userId: req.user.id } });

    let totalInvested = 0;
    let currentValue = 0;

    const enriched = await Promise.all(holdings.map(async (h) => {
      const asset = await Asset.findOne({ where: { symbol: h.symbol } });
      const currentPrice = asset ? asset.currentPrice : h.avgBuyPrice;
      const currentHoldingValue = currentPrice * h.quantity;
      const invested = h.totalInvested;
      const pnl = parseFloat((currentHoldingValue - invested).toFixed(2));
      const pnlPct = invested > 0 ? parseFloat(((pnl / invested) * 100).toFixed(2)) : 0;

      totalInvested += invested;
      currentValue += currentHoldingValue;

      return {
        id: h.id,
        symbol: h.symbol,
        name: h.name,
        type: h.type,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice,
        totalInvested: invested,
        currentValue: parseFloat(currentHoldingValue.toFixed(2)),
        pnl,
        pnlPct,
        logoColor: h.logoColor
      };
    }));

    const totalPnl = parseFloat((currentValue - totalInvested).toFixed(2));
    const totalPnlPct = totalInvested > 0 ? parseFloat(((totalPnl / totalInvested) * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        holdings: enriched,
        summary: {
          totalInvested: parseFloat(totalInvested.toFixed(2)),
          currentValue: parseFloat(currentValue.toFixed(2)),
          totalPnl,
          totalPnlPct,
          holdingsCount: enriched.length
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
