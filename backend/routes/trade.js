const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');

// POST /api/trade/buy
router.post('/buy', protect, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid symbol or quantity' });
    }

    const qty = parseFloat(quantity);

    // Get asset
    const asset = await Asset.findOne({ where: { symbol: symbol.toUpperCase() } });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const totalCost = parseFloat((asset.currentPrice * qty).toFixed(2));

    // Get user with balance
    const user = await User.findByPk(req.user.id);
    if (user.walletBalance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Need ₹${totalCost.toLocaleString('en-IN')}, have ₹${user.walletBalance.toLocaleString('en-IN')}`
      });
    }

    // Deduct from wallet
    user.walletBalance = parseFloat((user.walletBalance - totalCost).toFixed(2));
    await user.save();

    // Update portfolio (upsert)
    const existing = await Portfolio.findOne({ 
      where: { userId: user.id, symbol: asset.symbol } 
    });

    if (existing) {
      const newQty = existing.quantity + qty;
      const newTotalInvested = existing.totalInvested + totalCost;
      const newAvg = parseFloat((newTotalInvested / newQty).toFixed(2));

      existing.quantity = parseFloat(newQty.toFixed(6));
      existing.avgBuyPrice = newAvg;
      existing.totalInvested = parseFloat(newTotalInvested.toFixed(2));
      await existing.save();
    } else {
      await Portfolio.create({
        userId: user.id,
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        quantity: parseFloat(qty.toFixed(6)),
        avgBuyPrice: asset.currentPrice,
        totalInvested: totalCost,
        logoColor: asset.logoColor
      });
    }

    // Log transaction
    await Transaction.create({
      userId: user.id,
      type: 'buy',
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.type,
      quantity: qty,
      price: asset.currentPrice,
      totalAmount: totalCost,
      status: 'completed'
    });

    res.json({
      success: true,
      message: `Successfully bought ${qty} ${asset.symbol} for ₹${totalCost.toLocaleString('en-IN')}`,
      data: {
        symbol: asset.symbol,
        quantity: qty,
        price: asset.currentPrice,
        totalCost,
        newBalance: user.walletBalance
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trade/sell
router.post('/sell', protect, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid symbol or quantity' });
    }

    const qty = parseFloat(quantity);

    // Get asset
    const asset = await Asset.findOne({ where: { symbol: symbol.toUpperCase() } });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    // Check portfolio
    const holding = await Portfolio.findOne({ 
      where: { userId: req.user.id, symbol: asset.symbol } 
    });
    if (!holding || holding.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient holdings. You have ${holding ? holding.quantity.toFixed(4) : 0} ${asset.symbol}`
      });
    }

    const totalRevenue = parseFloat((asset.currentPrice * qty).toFixed(2));
    const costBasis = parseFloat((holding.avgBuyPrice * qty).toFixed(2));
    const profitLoss = parseFloat((totalRevenue - costBasis).toFixed(2));

    // Update wallet
    const user = await User.findByPk(req.user.id);
    user.walletBalance = parseFloat((user.walletBalance + totalRevenue).toFixed(2));
    await user.save();

    // Update portfolio
    const newQty = parseFloat((holding.quantity - qty).toFixed(6));
    if (newQty <= 0.000001) {
      await holding.destroy();
    } else {
      const newTotalInvested = parseFloat((holding.totalInvested - costBasis).toFixed(2));
      holding.quantity = newQty;
      holding.totalInvested = Math.max(0, newTotalInvested);
      await holding.save();
    }

    // Log transaction
    await Transaction.create({
      userId: req.user.id,
      type: 'sell',
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.type,
      quantity: qty,
      price: asset.currentPrice,
      totalAmount: totalRevenue,
      status: 'completed',
      profitLoss
    });

    res.json({
      success: true,
      message: `Successfully sold ${qty} ${asset.symbol} for ₹${totalRevenue.toLocaleString('en-IN')}`,
      data: {
        symbol: asset.symbol,
        quantity: qty,
        price: asset.currentPrice,
        totalRevenue,
        profitLoss,
        newBalance: user.walletBalance
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trade/deposit
router.post('/deposit', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0 || amount > 10000000) {
      return res.status(400).json({ success: false, message: 'Invalid amount (max ₹1 crore)' });
    }

    const user = await User.findByPk(req.user.id);
    user.walletBalance = parseFloat((user.walletBalance + parseFloat(amount)).toFixed(2));
    await user.save();

    await Transaction.create({
      userId: req.user.id,
      type: 'deposit',
      totalAmount: parseFloat(amount),
      status: 'completed',
      notes: 'Wallet top-up'
    });

    res.json({
      success: true,
      message: `₹${parseFloat(amount).toLocaleString('en-IN')} added to wallet`,
      newBalance: user.walletBalance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
