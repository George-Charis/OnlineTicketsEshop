const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    associated_event: {
        type: String,
        required: true
    },
    name: String,
    data: {
        type: Buffer,
        required: true
    }
});

module.exports = mongoose.model('Image',  imageSchema);