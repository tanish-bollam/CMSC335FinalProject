const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("Database connection error:", err));

// 2. Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. Session Config (For Login)
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: false
}));

// 4. Routes
const authRoutes = require('auth');
const apiRoutes = require('api');
const portfolioRoutes = require('portfolio');

app.use('/', authRoutes);
app.use('/', apiRoutes);
app.use('/portfolio', portfolioRoutes);

// 5. Start Server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});