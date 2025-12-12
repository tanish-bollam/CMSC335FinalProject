const express = require('express');
const router = express.Router();
const PortfolioItem = require('./portfolioIten');

router.get('/', async (req, res) => {
    // checking if user is logged in
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        // fetch portfolio items for the logged-in user
        const portfolio = await PortfolioItem.find({ owner: req.session.userId });

        // fetch current prices from CoinGecko API
        let prices = {};
        if (portfolio.length > 0) {
            // get unique coin IDs from portfolio
            const coinIds = Array.from(new Set(portfolio.map(p => p.coinId))).join(',');
            const apiKey = process.env.COINGECKO_API_KEY;

            // construct API URL (this is how the actual api works)
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`;

            // make the API call
            const response = await fetch(url);

            // check if response is ok
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            // get the JSON data
            prices = await response.json();
        }

        // render the index page with portfolio and prices
        res.render('index', { portfolio, prices });


    } catch (err) {
        // handle errors
        console.error("API Error:", err.message);
        res.render('index', { portfolio: [], prices: {}, error: "Error fetching market data." });
    }
});

module.exports = router;