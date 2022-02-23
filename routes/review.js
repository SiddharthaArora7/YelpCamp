const express = require('express');
const router = express.Router({mergeParams: true});
const {validatereview, isLoggedin, isReviewAuthor} = require('../middleware');
const Review = require('../models/review');
const Campground = require('../models/campground');
const AsyncError = require('../utils/AsyncError');
const ExpressError = require('../utils/ExpressError');
const review = require('../controllers/review');

router.post('/', isLoggedin ,validatereview, AsyncError(review.createReview))

router.delete('/:reviewId',isLoggedin, isReviewAuthor, AsyncError(review.deleteReview));

module.exports = router;