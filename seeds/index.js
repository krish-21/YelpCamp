// Script to Seed Database

const mongoose = require("mongoose");

// Models
const Campground = require("../models/campground");

// Seed Data
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

// DB Connection
mongoose.connect("mongodb://localhost:27017/yelpCamp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

// DB Connection Validation
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

// random element from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Seed the database
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randPrice = Math.floor(Math.random() * 20 + 10);
        const camp = new Campground({
            author: "6066a38c2b83aa51da5d6724",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur nulla nam sint laborum ex consequatur suscipit, officia cupiditate non, corporis repudiandae vitae aperiam incidunt beatae voluptatibus veniam dolorem sunt eius.",
            price: randPrice,
        });
        await camp.save();
    }
}

// close mongoose connection after seeding the database
seedDB().then(() => {
    mongoose.connection.close();
});
