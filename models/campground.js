const { string } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String,
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = {toJSON: {virtuals: true}}

const campgroundschema = new Schema({
    title: String,
    price: Number,
    description: String,
    geometry: {
        coordinates: {
            type: [Number],
            required: true
        },
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
    },
    location: String,
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

campgroundschema.virtual('properties.popupMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>`
});

campgroundschema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', campgroundschema);