const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Review = require("./Review");

const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    // author is defined by User
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    // reviews are defined by Review
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
});

// when a campground is deleted, delete all assoiated reviews
campgroundSchema.post("findOneAndDelete", async function (campground) {
    // if campground succesfully deleted
    if (campground) {
        // if it has any reviews
        if(campground.reviews.length) {
            // delete all reviews
            await Review.deleteMany({
                // where review._id = campground.reviews._id
                _id: {
                    $in: campground.reviews
                },
            });
        }
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);
