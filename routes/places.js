const express = require('express');
const router = express.Router();
const catchAsync = require('../helpErr/catchAsync');
const UkrSee = require('../models/UkrSeeSchema');
const {isLoggedIn, validateUkrSee, isAuthor} = require('../middlware');

const {storage} = require('../cloudinary/cloud');
const multer  = require('multer');
const upload = multer({storage});

const {cloudinary} = require('../cloudinary/cloud');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken})



//All
router.get('/', catchAsync( async(req, res) => {
    const places = await UkrSee.find({})
    res.render('places/all', {places})
}));

//new
router.get('/new', isLoggedIn,(req, res) => {
    res.render('places/new')
});

router.post('/',isLoggedIn, upload.array('image'), validateUkrSee, catchAsync( async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.place.location,
        limit: 1
      })
        .send();
    const place = new UkrSee(req.body.place);
    place.geometry = geoData.body.features[0].geometry;
    place.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    place.author = req.user._id
    await place.save();
    req.flash('success', 'Succsesfuly made a new place!');
    res.redirect(`/places/${place._id}`)
}));


//show
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    try {
        const place = await UkrSee.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        res.render('places/show', { place })
    } catch (err) {
            req.flash('error', `Can't find this place`);
            return res.redirect('/places')
        
    }
}));

//edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( async(req, res) => {
    const {id} = req.params;
    const place = await UkrSee.findById(id);
    if(!place) {
        req.flash('error', `Can't find this place`);
        return res.redirect('/places')
    };
    res.render('places/edit', {place})
}));

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateUkrSee, catchAsync( async(req, res) => {
    const {id} = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.place.location,
        limit: 1
      })
        .send();
    const place = await UkrSee.findByIdAndUpdate(id, {...req.body.place});
    place.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    place.images.push(...imgs);
    await place.save();
    if (req.body.delImg){
        //loop for del img from cloudinary
        for(let filename of req.body.delImg) {
            await cloudinary.uploader.destroy(filename);
        }
        await place.updateOne({$pull: {images: {filename: {$in: req.body.delImg}}}})
         console.log(place)
     }
    req.flash('success', 'Succsesfuly updated place!');
    res.redirect(`/places/${place._id}`)
}));


//delete
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const {id} = req.params;
    const place = await UkrSee.findByIdAndDelete(id)
    req.flash('success', 'Succsesfuly deleted place!');
    res.redirect('/places')
}));

module.exports = router;