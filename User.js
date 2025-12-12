const mongoose = require('mongoose');

// define the schema for users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;