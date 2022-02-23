if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo')(session);



const review = require('./models/review');

const userroutes = require('./routes/user')
const campgroundroutes = require('./routes/campground')
const reviewroutes = require('./routes/review');
const  helmet  = require('helmet');

const dburl =  process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind('console','Connection Error'));
db.once('open', ()=>{
    console.log('Database Connected')
})

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.end.SECRET || 'thisisnotagoodsession';

const store = new MongoStore({
    url: dburl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', function(e){
    console.log('Session Store Error', e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:  1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
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
                "https://res.cloudinary.com/srm-institute-of-science-and-technology-srmist-delhi-ncr-campus/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
app.use(mongoSanitize())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userroutes);
app.use('/campgrounds', campgroundroutes);
app.use('/campgrounds/:id/reviews', reviewroutes);

app.get('/', (req,res)=>{
    res.render('home') 
})

app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next)=>{
    const{statusCode = '500'} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong';
    res.status(statusCode).render('error', {err});
})

app.listen(3000, ()=>{
    console.log("Connection Open")
})