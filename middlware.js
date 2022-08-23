const UkrSee = require('./models/UkrSeeSchema');
const Review = require('./models/review')
const ExpressError = require('./helpErr/expressErr');
const { placeSchema, reviewSchema } = require('./schemas.js');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login')
    }
    next();
};



module.exports.validateUkrSee = (req, res, next) => {
    const {error} = placeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(element.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};


module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;
    const place = await UkrSee.findById(id);
    if (!place.author.equals(req.user._id)) {
        req.flash('error', `You can't edit this place`);
        return res.redirect(`/places/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewID} = req.params;
    const review = await Review.findById(reviewID);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', `You can't edit this place`);
        return res.redirect(`/places/${id}`);
    }
    next();
};


module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(element => element.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
};