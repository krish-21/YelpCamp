// Middleware to validate incoming data using JOI

// Joi Schemas
const { campgroundJoiSchema, reviewJoiSchema } = require("../utils/JoiSchemas");
const ExpressError = require("../utils/ExpressError");


// validate req.body for campground
module.exports.validateCampground = (req, res, next) => {
    // validate using JOI
    const { error } = campgroundJoiSchema.validate(req.body);

    // if data invalid, throw error
    if (error) {
        const message = error.details.map(err => err.message).join(",");
        throw new ExpressError(400, message);
    } else {
        // if data valid, continue
        next();
    }
};

// validate req.body for review
module.exports.validateReview = (req, res, next) => {
    // validate using JOI
    const { error } = reviewJoiSchema.validate(req.body);

    // if data invalid, throw error
    if (error) {
        const message = error.details.map(err => err.message).join(",");
        throw new ExpressError(400, message);
    } else {
        // if data valid, continue
        next();
    }
}
