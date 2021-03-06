// Controller for Campgrounds

// Models
const Campground = require("../models/Campground");

// cloudinary
const { cloudinary } = require("../cloudinary");

// mapbox setup
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

// renders the index page (all campgrounds)
module.exports.index = async (req, res) => {
    // query db
    const campgrounds = await Campground.find({});
    
    // render index with all campgrounds
    res.render("campgrounds/index", { campgrounds });
};

// renders the form to create a new campground
module.exports.renderNewForm = (req, res) => {
    // render new empty form
    res.render("campgrounds/new");
};

// creates a new campground and saves to db
module.exports.createCampground = async (req, res, next) => {
    // create a new campground from submitted data
    const campground = new Campground(req.body.campground);
    
    // add the images to campground
    // images exist in 'req.files', added by multer
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // get data using MapBox API
    // returns GeoJSON
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // add coordinates to campground
    campground.geometry = geoData.body.features[0].geometry;
    // add the author as logged-in user
    campground.author = req.user._id;
    
    // save to db
    const newCampground = await campground.save();
    
    // set success flash message
    req.flash("success", "Successfully made a new campground!");
    
    // redirect to show page of new campground
    res.redirect(`/campgrounds/${newCampground._id}`);
};

// renders the page for showing details of a campground
module.exports.showCampground = async (req, res) => {
    // destructure params
    const { id } = req.params
    
    // query db for campground & populate author & reviews with authors
    const campground = await Campground.findById(id)
        .populate("author", "username")
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        });
    
    // if campground doesn't exist, redirect to index
    if (!campground) {
        // set error flash message
        req.flash("error", "Cannot find Campground");
        // redirect user to index
        return res.redirect("/campgrounds");
    }
    
    // render the page with details of campground
    res.render("campgrounds/show", { campground });
};

// renders the form for editing a campground
module.exports.renderEditForm = async (req, res) => {
    // destructure params
    const { id } = req.params;

    // query db
    const campground = await Campground.findById(id);
    
    // if campground doesn't exist, redirect to index
    if (!campground) {
        // set error flash message
        req.flash("error", "Cannot find Campground");
        // redirect user to index
        return res.redirect("/campgrounds");
    }
    
    // render edit from with filled in data
    res.render("campgrounds/edit", { campground });
};

// updates the campground and saves to db
module.exports.updateCampground = async (req, res) => {
    // destructure params
    const { id } = req.params;
    
    // existence of campground is taken care of by 'isCampAuthor' middleware
    // update campground in db
    const updatedCampground = await Campground.findByIdAndUpdate(id, {...req.body.campground});

    // extract images from req
    // images exist in 'req.files', added by multer
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))

    // update images to campground
    updatedCampground.images.push(...images);

    // save to db
    updatedCampground.save();

    // if any images need to be deleted
    if (req.body.deleteImages) {
        // delete from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        // delete from db
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}});
    }

    // set success flash message
    req.flash("success", "Successfully updated the campground!");
    
    // after updation, redirect user back to details page
    res.redirect(`/campgrounds/${updatedCampground._id}`);
};

// deletes the campground from db
module.exports.deleteCampground = async (req, res) => {
    // destructure params
    const { id } = req.params;
    
    // existence of campground is taken care of by 'isCampAuthor' middleware
    // delete campground from db
    const deletedCampground = await Campground.findByIdAndDelete(id);
    
    // set success flash message
    req.flash("success", "Successfully deleted campground!");
    
    // redirect user to index page
    res.redirect("/campgrounds");
};
