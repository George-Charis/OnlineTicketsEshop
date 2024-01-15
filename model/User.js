const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    uid: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    role: Number,
    total_tickets: {
        type: Number,
        default: 0
    },
    total_money_spend: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: String,
    resetToken: String
});

module.exports = mongoose.model('User', userSchema);