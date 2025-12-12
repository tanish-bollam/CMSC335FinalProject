const express = require('express');
const router = express.Router();
const PortfolioItem = require('./portfolioIten');

// helper function to check login status
const requireLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    next();
};

// post to add a coin
router.post('/add', requireLogin, async (req, res) => {
    try {
        let { coinId, amount, action } = req.body;

        // make the coinID lowercase and add hypens for coins that may have spaces
        coinId = coinId.toLowerCase().trim().replace(/\s+/g, '-');

        // capitalize the first letter for the display name
        const coinName = coinId.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // parse amount to float
        const parsedAmount = parseFloat(amount);

        // validate if the  crypto exists via CoinGecko API using fetch
        try {
            const apiKey = process.env.COINGECKO_API_KEY;
            const validateUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`;
            const validateResponse = await fetch(validateUrl);
            const data = await validateResponse.json();

            // if the api returns empty, the coin doesn't exist
            if (!data || Object.keys(data).length === 0) {
                // fetch user's portfolio to re-render with error
                const portfolio = await PortfolioItem.find({ owner: req.session.userId });

                // fetch prices for existing items
                let prices = {};
                if (portfolio.length > 0) {
                    const coinIds = Array.from(new Set(portfolio.map(p => p.coinId))).join(',');
                    const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`;
                    const priceResponse = await fetch(priceUrl);
                    prices = await priceResponse.json();
                }

                // render index with error message
                return res.render('index', {
                    portfolio,
                    prices,
                    error: `Crypto "${coinName}" does not exist. Please check the name and try again.`
                });
            }
            // catch validation errors with the api
        } catch (apiErr) {
            console.error('API validation error:', apiErr.message);
            const portfolio = await PortfolioItem.find({ owner: req.session.userId });
            return res.render('index', {
                portfolio,
                prices: {},
                error: 'Unable to validate cryptocurrency. Please try again.'
            });
        }

        // check if the action is subtract
        if (action === 'subtract') {
            // if it is, find the existing item and subtract it
            const existing = await PortfolioItem.findOne({
                coinId: coinId,
                owner: req.session.userId
            });

            // if exists, subtract the amount
            if (existing) {
                const newAmount = existing.amount - parsedAmount;

                // if the amount goes to 0 or below, delete the item
                if (newAmount <= 0) {
                    await PortfolioItem.findOneAndDelete({
                        _id: existing._id,
                        owner: req.session.userId
                    });
                } else {
                    existing.amount = newAmount;
                    await existing.save();
                }
            }
            // if the item doesnt exist, just ignore the subtract
        } else {
            // add the coin to the portfolio
            const existing = await PortfolioItem.findOne({
                coinId: coinId,
                owner: req.session.userId
            });

            // if exists, update the amount
            if (existing) {
                existing.amount += parsedAmount;
                await existing.save();
            } else {
                // create new portfolio item
                await PortfolioItem.create({
                    coinId: coinId,
                    coinName: coinName,
                    amount: parsedAmount,
                    owner: req.session.userId
                });
            }
        }

        // redirect back to home
        res.redirect('/');
    } catch (err) {
        // handle errors
        console.error(err);
        res.send("Error saving coin.");
    }
});

// post to delete the coin from portfolio
router.post('/delete', requireLogin, async (req, res) => {
    try {
        // only delete if the owner matches the logged in user
        await PortfolioItem.findOneAndDelete({
            _id: req.body.id,
            owner: req.session.userId
        });
        res.redirect('/');
    } catch (err) {
        // handle errors
        res.send("Error deleting.");
    }
});

module.exports = router;