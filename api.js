const express = require('express');
const router = express.Router();
const PortfolioItem = require('./portfolioIten');

router.get('/', async (req, res) => {
    // 1. Guard: Login check
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        // 2. Fetch DB Items
        const portfolio = await PortfolioItem.find({ owner: req.session.userId });

        // 3. Fetch Prices using NATIVE FETCH
        let prices = {};
        if (portfolio.length > 0) {
            const coinIds = [...new Set(portfolio.map(p => p.coinId))].join(',');
            const apiKey = process.env.COINGECKO_API_KEY;

            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`;

            // --- START CHANGE ---
            const response = await fetch(url);

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            prices = await response.json();
            // --- END CHANGE ---
        }

        // 4. Render
        res.render('index', { portfolio, prices });

    } catch (err) {
        console.error("API Error:", err.message);
        res.render('index', { portfolio: [], prices: {}, error: "Error fetching market data." });
    }
});

module.exports = router;