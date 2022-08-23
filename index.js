if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
};

const express = require('express')
const app = express()
const engine = require('ejs-mate');
const port = process.env.PORT || 3000
const mongoose = require('mongoose');
const  methodOverride = require('method-override')
const req = require('express/lib/request');
const path = require('path');

const ExpressError = require('./helpErr/expressErr')

const session = require('express-session')
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

const usersRoutes = require('./routes/users')
const places = require('./routes/places');
const reviews = require('./routes/reviews')

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/ukr'

// 'mongodb://localhost:27017/ukr'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', engine)
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
    mongoUrl: dbUrl, 
    secret,
    touchAfter: 24 * 60 * 60  //in seconds
});

store.on('error', function(e){
    console.log('session store error', e)
});

//Session
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

//Helmet
app.use(helmet({
    crossOriginEmbedderPolicy: false,
  }));


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://images.unsplash.com/",
    "https://res.cloudinary.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhht4vasz/",  
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Using PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Flash
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', usersRoutes);
app.use('/places', places);
app.use('/places/:id/reviews', reviews);

// Home page
app.get('/', (req, res) => {
    res.render('homePage')
})




//Error handling
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const {status = 500} = err;
    if (!err.message) err.message = 'Something went wrong!'
    res.status(status).render('error', {err})
})


app.listen(port, () => {
    console.log(`listening on port ${port}`)
  });
  