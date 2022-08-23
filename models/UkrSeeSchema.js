const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
});
//correcting size of img
ImageSchema.virtual('thumbnail').get(function (){
    return this.url.replace('/upload', '/upload/w_200,h_200,c_scale')
});

//for convertation to JSON
const opts = {toJSON: {virtuals: true}};

const UkrSeeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    region: String,
    images: [ImageSchema],
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
    location: {
        type: String,
        required: true
    },
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Review'
        }
    ]
    
}, opts);

UkrSeeSchema.virtual('properties.popUpMarkup').get(function (){
    return `<a href="/places/${this._id}">${this.title}</a>`
});

//del all reviews with deleted place
UkrSeeSchema.post('findOneAndDelete', async function(document) {
    if (document){
        await Review.deleteMany({
            _id: {
                $in: document.reviews
            }
        })
    }
})

const UkrSee = mongoose.model('UkrSee', UkrSeeSchema);
module.exports = UkrSee;