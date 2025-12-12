const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
require('dotenv').config();

(async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        console.log("Connected to MongoDB Atlas");

        // required middleware so it works later
        app.set('view engine', 'ejs');
        app.set('views', __dirname);
        app.use(express.urlencoded({ extended: true }));
        app.use(express.static(__dirname));

        // session setup
        app.use(session({
            secret: process.env.SESSION_SECRET || 'defaultSecret',
            resave: false,
            saveUninitialized: false
        }));

        // routing from other files
        const authRoutes = require('./auth');
        const apiRoutes = require('./api');
        const portfolioRoutes = require('./portfolio');

        app.use('/', authRoutes);
        app.use('/', apiRoutes);
        app.use('/portfolio', portfolioRoutes);

        // start the server and listen on port 4000
        const PORT = 4000;
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        // handle connection errors
        console.error("Database connection error:", err);
        process.exit(1);
    }
})();