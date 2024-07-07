const express = require('express');
const router = express.Router({mergeParams:true});
const {campgroundSchema} = require('../schemas.js')
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const mbxGeocoding =require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapBoxToken});
const {IsLoggedIn} = require('../middlewares.js');
const {cloudinary} = require('../cloudinary')



const {storage} = require('../cloudinary')
const multer  = require('multer')
const upload = multer({ storage })

const events = require('events');
events.EventEmitter.defaultMaxListeners = 20; // Increase the limit globally


const validateCampgorund = (req,res,next)=>{
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    } 
}

const isAuthor = async(req,res,next)=>{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


router.get('/',catchAsync(async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}));
router.get('/new',IsLoggedIn,(req,res)=>{
    res.render('campgrounds/new');
})
router.get('/:id',catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    // console.log(campground.author.username);
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}));
router.post('/',IsLoggedIn,upload.array('image', 12),validateCampgorund,catchAsync(async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
        query : req.body.campground.location,
        limit:5
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry=geodata.body.features[0].geometry;
     campground.images = req.files.map(f=>( {url:f.path,filename :f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully created new Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
    
}));

router.get('/:id/edit',isAuthor,IsLoggedIn,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
}));

router.put('/:id',isAuthor,IsLoggedIn,upload.array('image'),validateCampgorund, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f=>( {url:f.path,filename :f.filename}));
    campground.images.push(...imgs );
    await campground.save();
    if(req.body.deleteImages){
        await campground.updateOne({ $pull : {images :{ filename : {$in : req.body.deleteImages}}}});
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        console.log(campground);
    }
    req.flash('success','Successfully Updated a campground!!')
    res.redirect(`/campgrounds/${campground.id}`)
}));

router.delete('/:id',isAuthor,IsLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))
module.exports = router;