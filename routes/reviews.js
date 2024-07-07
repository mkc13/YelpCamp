const express = require('express');
const router = express.Router({mergeParams : true });
const Review = require('../models/reviews.js');
const {reviewSchema} = require('../schemas.js')
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const bodyParser = require('body-parser');
const {IsLoggedIn} = require('../middlewares.js');



const validateReview = (req,res,next)=>{
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
    
}

router.post('/',IsLoggedIn,validateReview, catchAsync(async(req,res)=>{
  
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Review Submitted');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewID',IsLoggedIn,catchAsync(async(req,res)=>{
    const {id,reviewID } = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewID}});
    await Review.findByIdAndDelete(reviewID);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports= router;