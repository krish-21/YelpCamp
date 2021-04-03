// Routes for Authentication

const express = require("express");
const router = express.Router();
const passport = require("passport");

// Controllers for Authentication
const authController = require("../controllers/authController");

// Wrapper Function for catching Async Errors
const catchAsync = require("../utils/catchAsync");

// registration routes
router.route("/register")
    .get(authController.renderRegisterForm)
    .post(catchAsync(authController.register));

// login routes
router.route("/login")
    .get(authController.renderLoginForm)
    .post(
        // use passport to log user in
        passport.authenticate(
            // use local login
            "local", 
            // options
            { 
                // set error flash message
                failureFlash: true, 
                // redirect to login page if error in logging in
                failureRedirect: "/login" 
            }
        ),
        authController.afterLogin
    );

// logout route
router.get("/logout", authController.logout);

module.exports = router;
