const express = require('express');
const router = express.Router();
const User = require('./User');

// get the login page
router.get('/login', (req, res) => {
    res.render('login');
});

// post the register user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('login', { error: 'Username already taken.' });
        }

        // if no existing user, create it
        const user = await User.create({ username, password });

        // log in the user
        req.session.userId = user._id;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Error creating account.' });
    }
});

// post the login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        // check the password (plain text for now im lazy :(   )
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

// get the logout route
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;