const express = require('express');
const router = express.Router();
const AsyncError = require('../utils/AsyncError');
const Campground = require('../models/campground');
const{isLoggedin, isAuthor} = require('../middleware');
const campgrounds = require('../controllers/campground')
const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({ storage })

const { findByIdAndUpdate, findByIdAndDelete } = require('../models/campground');
const req = require('express/lib/request');

router.route('/')
    .get(AsyncError(campgrounds.index))
    .post(isLoggedin, upload.array('image'), AsyncError(campgrounds.createCampground))
  

router.get('/new', isLoggedin, campgrounds.renderNewForm)

router.route('/:id')
    .get(AsyncError(campgrounds.showCampground))
    .put(isLoggedin, isAuthor, upload.array('image'), AsyncError(campgrounds.updateCampground))
    .delete(isLoggedin, isAuthor, AsyncError(campgrounds.deleteCampground))
 
 router.get('/:id/edit', isLoggedin, isAuthor, AsyncError(campgrounds.renderEdit));
 
 module.exports = router;