// Middleware for checking Authentication & Authorization

// Models
const Campground = require("../models/Campground");
const Review = require("../models/Review")

// Wrapper Function for catching Async Errors
const catchAsync = require("../utils/catchAsync")

// checks if user is logged-in
module.exports.isLoggedIn = (req, res, next) => {
    // use passport to check if user is logged-in
    if(!req.isAuthenticated()) {    
        // set error flash message
        req.flash("error", "You must be signed in!");
    
        // redirect user to login page
        // end execution
        return res.redirect("/login");
    }
    
    // if logged-in, continue
    next();
};

// checks if logged-in user is author of campground
module.exports.isCampAuthor = catchAsync(async (req, res, next) => {
    // destructure params
    const { id } = req.params;
    
    // query db
    const campground = await Campground.findById(id);
    
    // if campground doesn't exist, redirect to index
    if (!campground) {
        // set error flash message
        req.flash("error", "Cannot find Campground");
        // redirect user to index
        // end execution
        return res.redirect("/campgrounds");
    }
    
    // compare id of logged-in user and author of campground
    if (!campground.author.equals(req.user._id)) {
        // set error flash message
        req.flash("error", "You do not have permission to do that");
        // redirect user to campground details page
        // end execution
        return res.redirect(`/campgrounds/${id}`);
    }
    
    // if authorized, continue
    next();
});

// checks if logged-in user is author of review
module.exports.isReviewAuthor = catchAsync(async (req, res, next) => {
    // destructure params
    const { id, reviewId } = req.params;
    
    // query db
    const review = await Review.findById(reviewId);
    
    // if review doesn't exist
    if (!review) {
        // set error flash message
        req.flash("error", "Cannot find Review");
        // redirect user to campground details page
        // end execution
        return res.redirect(`/campgrounds/${id}`);
    }
    
    // compare id of logged-in user and author of review
    if (!review.author.equals(req.user._id)) {
        // set error flash message
        req.flash("error", "You do not have permission to do that");
        // redirect user to campground details page
        // end execution
        return res.redirect(`/campgrounds/${id}`);
    }
    
    // if authorized, continue
    next();
});
