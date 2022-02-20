const mongoose = require('mongoose');
const {Schema} = mongoose;

const reviews = new Schema({
    body: String,
    rating: Number,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Review', reviews);