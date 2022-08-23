const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../helpErr/catchAsync');
const passport = require('passport');

//Register
router.get('/register', (req, res) => {
    res.render('users/register')
});

router.post('/register', catchAsync(async(req, res, next) => {
    try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
        if(err) return next(err);
        req.flash('success', 'Welcome to UkraineSee');
        res.redirect('/places');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
}));

//LogIn
router.get('/login', (req, res) => {
    res.render('users/login')
});

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success','Welcome back!');
    const redirectUrl = req.session.returnTo || '/places';
    res.redirect(redirectUrl);
});

//LogOut
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
          return next(err);
        }
        req.flash('success','Goodbye!');
        res.redirect('/places');
    });
});

module.exports = router;