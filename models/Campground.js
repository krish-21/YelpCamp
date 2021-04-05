const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Review = require("./Review");


const ImageSchema = new Schema({
    url: String,
    filename: String,
});

// mongoose virtual for thumbnails
ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});


const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
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
}, opts);

// mongoose virtual for pop-up HTML on cluster map
// to conform to geoJSON 'properties' fiels
campgroundSchema.virtual("properties.popUpMarkup").get(function() {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 30)}...</p>`;
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
