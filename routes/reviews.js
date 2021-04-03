// Routes for Reviews

const express = require("express");
                                // option for access to previously matched params
                                // merge all the params
const router = express.Router({ mergeParams: true });

// Controllers for Reviews
const reviewController = require("../controllers/reviewController");

// Joi Validation Middleware
const { validateReview } = require("../middleware/JoiValidation")

// Auth middleware
const { isLoggedIn, isReviewAuthor } = require("../middleware/auth")

// Wrapper Function for catching Async Error
const catchAsync = require("../utils/catchAsync");


// Add a review
router.post(
    "/", 
    // check if user is logged-in
    isLoggedIn, 
    // use JOI to vaidate data
    validateReview, 
    // create review
    catchAsync(reviewController.createReview)
);

// Delete a review
router.delete(
    "/:reviewId", 
    // check if user is logged-in
    isLoggedIn, 
    // check is user is the author
    isReviewAuthor, 
    // delete review
    catchAsync(reviewController.deleteReview)
);

module.exports = router;
