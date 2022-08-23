const express = require('express');
const router = express.Router({mergeParams: true});

const catchAsync = require('../helpErr/catchAsync');


const UkrSee = require('../models/UkrSeeSchema');
const Review = require('../models/review')

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middlware');




//REVIEWS
router.post('/', isLoggedIn, validateReview, catchAsync(async(req,res) => {
    const place = await UkrSee.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id
    place.reviews.push(review);
    await review.save();
    await place.save();
    res.redirect(`/places/${place._id}`)
}));

//del review for specific place
router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(async(req, res) => {
    const { id, reviewID } = req.params;
    await UkrSee.findByIdAndUpdate(id, { $pull: { reviews: reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'Succsesfuly deleted place!');
    res.redirect(`/places/${id}`)
}));

module.exports = router;