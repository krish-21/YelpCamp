const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// configure the keys for Cloudinary Storage
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// storage object to be passed to multer
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        // folder in cloudinary
        folder: "YelpCamp",
        allowedFormats: ["jpeg", "jpg", "png"],
    },
});

module.exports = {
    cloudinary,
    storage,
};
