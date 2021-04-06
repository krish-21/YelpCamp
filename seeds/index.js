// Script to Seed Database

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");

// Models
const Campground = require("../models/campground");

// Seed Data
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

// Mongo Atlast DB
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelpCamp";

// DB Connection
mongoose.connect(dbUrl, {
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
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randPrice = Math.floor(Math.random() * 20 + 10);
        const camp = new Campground({
            author: "606becba491d9193b63d3362",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur nulla nam sint laborum ex consequatur suscipit, officia cupiditate non, corporis repudiandae vitae aperiam incidunt beatae voluptatibus veniam dolorem sunt eius.",
            price: randPrice,
            images: [
                {
                    url: 'https://res.cloudinary.com/krish-21/image/upload/v1617600214/YelpCamp/myqvukxcwhnlatxc3vi6.jpg',
                    filename: 'YelpCamp/myqvukxcwhnlatxc3vi6',
                },
                {
                    url: 'https://res.cloudinary.com/krish-21/image/upload/v1617604670/YelpCamp/photo-1445308394109-4ec2920981b1_hsrlhz.webp',
                    filename: 'YelpCamp/photo-1445308394109-4ec2920981b1_hsrlhz',
                }
            ],
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ],
            },
        });
        await camp.save();
    }
}

// close mongoose connection after seeding the database
seedDB().then(() => {
    mongoose.connection.close();
});
