// Controllers for Reviews

// Models
const Campground = require("../models/Campground");
const Review = require("../models/Review");

// creates a new review and stores it in db
module.exports.createReview = async (req, res) => {
    // destructure params
    const { id } = req.params;
    const { review: reviewData } = req.body;
    
    // query db for campground
    const campground = await Campground.findById(id);

    // if campground doesn't exist, redirect to index
    if (!campground) {
        // set error flash message
        req.flash("error", "Cannot find Campground");
        // redirect user to index
        return res.redirect("/campgrounds");
    }

    // create new Review instance
    const review = new Review(reviewData);
    // set author is logged-in user
    review.author = req.user._id
    
    // add review ref to cammpground
    campground.reviews.push(review);
    
    // save in db
    await review.save();
    await campground.save();
    
    // set success flash message
    req.flash("success", "Successfully saved review!");
    
    // redirect user to details page of campground
    res.redirect(`/campgrounds/${campground._id}`);
}

// deletes the review from db
module.exports.deleteReview = async (req, res) => {
    // destructure params
    const { id, reviewId } = req.params;
    
    // delete review ref from campground
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    // delete review from db
    await Review.findByIdAndDelete(reviewId);
    
    // set success flash message
    req.flash("success", "Successfully deleted review!");

    // redirect user to details page of campground
    res.redirect(`/campgrounds/${id}`);
};
