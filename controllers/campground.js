const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary/index')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxtoken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxtoken });




module.exports.index = (async (req,res, next)=>{
    const campgrounds = await Campground.find({})
    res.render('campground/index', {campgrounds});
 });

 module.exports.renderNewForm = (req,res)=>{
    res.render('campground/new')
}

module.exports.createCampground = async(req, res, next)=>{
    const geodata = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1,
    }).send();
    const camp = new Campground(req.body)
    camp.geometry = geodata.body.features[0].geometry;
    camp.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'Successfully Created Campground ');
    res.redirect(`/campgrounds/${camp._id}`)
 }

module.exports.showCampground = async(req, res, next)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate:{
            path: 'author'
        }
       }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campground/show', {campground});
}

module.exports.renderEdit = async(req,res,next)=>{
    const campground = await Campground.findById(req.params.id)
    if(!campground){
       req.flash('error', 'Cannot find that Campground');
       return res.redirect('/campgrounds');
   }
    res.render('campground/edit', {campground});
}

module.exports.updateCampground = async(req,res,next)=>{
    const{id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body})
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash('success', 'Successfully Updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req,res,next)=>{
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds');
}