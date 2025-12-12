const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET: Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

// POST: Register User
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('login', { error: 'Username already taken.' });
        }

        // Create User
        const user = await User.create({ username, password });

        // Log them in
        req.session.userId = user._id;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Error creating account.' });
    }
});

// POST: Login User
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        // Check password (Plain text comparison)
        if (user && user.password === password) {
            req.session.userId = user._id;
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid Credentials.' });
        }
    } catch (err) {
        res.render('login', { error: 'Login failed.' });
    }
});

// GET: Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;