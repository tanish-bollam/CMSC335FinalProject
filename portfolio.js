const express = require('express');
const router = express.Router();
const PortfolioItem = require('../models/PortfolioItem');

// Helper function to check login status
const requireLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    next();
};

// POST: Add Coin
router.post('/add', requireLogin, async (req, res) => {
    try {
        const { coinId, amount } = req.body;

        // Mapping readable names
        const names = {
            'bitcoin': 'Bitcoin',
            'ethereum': 'Ethereum',
            'dogecoin': 'Dogecoin',
            'solana': 'Solana',
            'cardano': 'Cardano'
        };

        await PortfolioItem.create({
            coinId: coinId,
            coinName: names[coinId] || coinId,
            amount: parseFloat(amount),
            owner: req.session.userId // Links to the logged-in user
        });

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send("Error saving coin.");
    }
});

// POST: Delete Coin
router.post('/delete', requireLogin, async (req, res) => {
    try {
        // Only delete if the ID matches AND the owner matches (security)
        await PortfolioItem.findOneAndDelete({
            _id: req.body.id,
            owner: req.session.userId
        });
        res.redirect('/');
    } catch (err) {
        res.send("Error deleting.");
    }
});

module.exports = router;