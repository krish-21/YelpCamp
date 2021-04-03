const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// library for using mongoose and local authentication
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is Required!"],
        unique: true,
    },
});

// will add username, salt & hash fields & other functions
// will ensure username is uniwue
// will add various functions to schema & instances
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
