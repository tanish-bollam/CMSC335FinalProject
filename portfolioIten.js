const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    coinId: {
        type: String,
        required: true
    },
    coinName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});


const PortfolioItem = mongoose.model('PortfolioItem', portfolioSchema);
module.exports = PortfolioItem;