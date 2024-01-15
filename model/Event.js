const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    event_name: {
        type: String,
        required: true
    },
    event_description: {
        type: String,
        required: true
    },
    event_date: {
        type: Date,
        required: true
    },
    event_coordinates: {
        type: String,
        required: true
    },
    event_ticket_price: {
        type: Number,
        required: true
    }, 
    event_images: [{
        type: String
    }]
});

module.exports = mongoose.model('Event', eventSchema);