const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    date_of_event:{
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Order', orderSchema);