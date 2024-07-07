const { number } = require('joi');
const mongoose = require('mongoose');
const {Schema } = mongoose;

const reviewSchema = new Schema({
    body: String, // Change from 'review' to 'body'
    author:
        {
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    ,
    rating: Number
});
module.exports = mongoose.model('Review',reviewSchema);