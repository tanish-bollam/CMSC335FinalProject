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
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, 'public'))); // Serve CSS

// 3. Session Config (For Login)
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: false
}));

// 4. Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const portfolioRoutes = require('./routes/portfolio');

app.use('/', authRoutes);      // Login/Register
app.use('/', apiRoutes);       // Dashboard (Home)
app.use('/portfolio', portfolioRoutes); // Add/Delete Coins

// 5. Start Server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});