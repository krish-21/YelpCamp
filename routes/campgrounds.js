// Routes for Campgrounds

const express = require("express");
const router = express.Router();

// Controllers for Campgrounds
const campgroundController = require("../controllers/campgroundController");

// Wrapper Function for catching Async Errors
const catchAsync = require("../utils/catchAsync");

// Auth middleware
const { isLoggedIn, isCampAuthor } = require("../middleware/auth");

// JOI Validation Middleware
const { validateCampground } = require("../middleware/JoiValidation");

router.route("/")
    // Index Route
    // List of all the campgrounds with basic info
    .get(catchAsync(campgroundController.index))
    
    // Create a new Campground
    .post(
        // check if user is logged-in
        isLoggedIn, 
        // use JOI to vaidate data
        validateCampground, 
        // create campground
        catchAsync(campgroundController.createCampground)
    );


// New Campground Form
router.get(
    "/new", 
    // check if user is logged-in
    isLoggedIn, 
    // render form
    campgroundController.renderNewForm
);

router.route("/:id")
    // Show details of a campground by id
    .get(catchAsync(campgroundController.showCampground))
    
    // Update a campground by id
    .put(
        // check if user is logged-in
        isLoggedIn, 
        // check is user is the author
        isCampAuthor, 
        // use JOI to vaidate data
        validateCampground, 
        // update campground
        catchAsync(campgroundController.updateCampground)
    )

    // Delete a campground by id
    .delete(
        // check if user is logged-in
        isLoggedIn, 
        // check is user is the author
        isCampAuthor, 
        // delete campground
        catchAsync(campgroundController.deleteCampground)
    );

// Edit a campground by id
router.get(
    "/:id/edit", 
    // check if user is logged-in
    isLoggedIn, 
    // check is user is the author
    isCampAuthor, 
    // render form
    catchAsync(campgroundController.renderEditForm)
);

module.exports = router;
