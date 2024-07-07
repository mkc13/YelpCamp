const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review =  require('./reviews')

const ImageSchema = new Schema({
    url:String,
    filename:String
})
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/uplaod','/upload/w_200');
})
const opts = {toJSON :{virtuals:true}};

const CampgroudSchema = new Schema({
    location:String,
    title:String,
    images:[ImageSchema],
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    description: String,
    price:Number,
    author:
        {
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    ,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},opts);


CampgroudSchema.virtual('properties.popUpMarkup').get(function(){
    return `<a href="/campgrounds/${this._id}">${this.title} </a>`
})

CampgroudSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground',CampgroudSchema);