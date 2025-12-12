const express = require('express');
const router = express.Router();
const axios = require('axios');
const PortfolioItem = require('../models/PortfolioItem');

router.get('/', async (req, res) => {
    // 1. Guard: If not logged in, redirect to login
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        // 2. Fetch DB Items for THIS user only
        const portfolio = await PortfolioItem.find({ owner: req.session.userId });

        // 3. Fetch Prices from CoinGecko API
        let prices = {};
        if (portfolio.length > 0) {
            // Get unique IDs (e.g., "bitcoin,ethereum")
            const coinIds = [...new Set(portfolio.map(p => p.coinId))].join(',');

            // Get API Key from .env
            const apiKey = process.env.COINGECKO_API_KEY;

            // UPDATED AXIOS CALL:
            // We verify if an API key exists to append it to the URL
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`;

            const response = await axios.get(url);
            prices = response.data;
        }

        // 4. Render
        res.render('index', { portfolio, prices });

    } catch (err) {
        console.error("API Error:", err.message);
        // Render with empty data if API fails so the app doesn't crash
        res.render('index', { portfolio: [], prices: {}, error: "Error fetching market data." });
    }
});

module.exports = router;