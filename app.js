if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Use MongoDB as Session Storage instead of Memory
const MongoStore = require("connect-mongo");

// Security
// Sanitize for Mongo Injections
const mongoSanitize = require("express-mongo-sanitize");
// Setting HTTP Headers for Security
const helmet = require("helmet");

// Mongo Atlast DB
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelpCamp";

// Models
const User = require("./models/User");


// Routes
const authRoutes = require("./routes/auth");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");


// Custom Error Class
const ExpressError = require("./utils/ExpressError");

// DB Connection
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

// DB Connection Validation
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

// instantiate express app
const app = express();

// EJS Mate & View Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// To parse incoming requests
app.use(express.urlencoded({ extended: true }));
// To identify other types of requests
app.use(methodOverride("_method"));
// use public directory for serving static files
app.use(express.static(path.join(__dirname, "public")));
// instantiate the santization object
app.use(mongoSanitize({
    replaceWith: "_"
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,   // in seconds
    crypto: {
        secret,
    }
});

store.on("error", function (e) {
    console.log("Session Store Error!", e);
});

// set up express session
const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),    // in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}
app.use(session(sessionConfig));

// use connect-flash
app.use(flash());

// instantiate helmet
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
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
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/krish-21/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// should be done after session acc to docs
// Initialize passport
app.use(passport.initialize());
// for login persistence
app.use(passport.session());

// use local strategy with authentication method located on User method
// authenticate() is added automatically by passport-local-mongoose to the model
passport.use(new LocalStrategy(User.authenticate()));

// how to store user in session
passport.serializeUser(User.serializeUser());

// how to un-store user in session
passport.deserializeUser(User.deserializeUser());

// make flash available as a local variable in templates without passing it explicitly
app.use((req, res, next) => {
    // if not coming from login or homepage
    if (!["/register", "/login", "/"].includes(req.originalUrl)) {
        // set returnToUrl after login
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


// Setting Routes
app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);


// Homepage
app.get("/", (req, res) => {
    res.render("home");
});


// Handle all other unmatched routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handling Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Something Went Wrong"
    res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;

// start server
app.listen(port, () => {
    console.log(`Serving on Port ${port}`);
});
