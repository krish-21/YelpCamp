// Controllers for Authentication

// Models
const User = require("../models/User");

// renders the registration form
module.exports.renderRegisterForm = (req, res) => {
    // is user is already login, redirect to index
    if (req.isAuthenticated()) {
        return res.redirect("/campgrounds");
    }
    // render new empty form
    res.render("auth/register");
};

// creates new user & stores credentials in db
module.exports.register = async (req, res) => {
    try {
        // destructure params
        const { email, username, password } = req.body;
        
        // create new User instance with submitted email & username
        const newUser = new User({ email, username });

        // use passport's register function
        // automatically hashes the password
        // stores the salt and hash
        const registeredUser = await User.register(newUser, password);
        
        // auto login user after registration
        req.login(registeredUser, err => {
            // if any error, use default error handler
            if (err) return next(err);

            // set success flash message
            req.flash("success", "Welcome to Yelpcamp!");

            // after successful login, redirect to index
            res.redirect("/campgrounds");
        });
    } catch (err) {
        // set error flash message
        req.flash("error", err.message);
        
        // redirect user to registration page
        res.redirect("/register")
    }    
}

// renders the login form
module.exports.renderLoginForm = (req, res) => {
    // is user is already login, redirect to index
    if (req.isAuthenticated()) {
        return res.redirect("/campgrounds");
    }
    // render empty login form
    res.render("auth/login");
};

// after login is handled by passport
// redirects the user
module.exports.afterLogin = (req, res) => {
    // set redirect url to session variable
    // or default to index
    const redirectUrl = req.session.returnTo || "/campgrounds";
    
    // set success flash message
    req.flash("success", "Welcome back!");

    // redirect url to previously set url
    res.redirect(redirectUrl);
};

// logs out the user
module.exports.logout = (req, res) =>{
    // use passport to log user out
    req.logout();

    // set success flash message
    req.flash("success", "Log out successful");

    // redirect user to index
    res.redirect("/campgrounds");
};
