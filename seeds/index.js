const mongoose = require("mongoose");
const cities = require("./cities")
const Campground = require("../models/campground");
const {places, descriptors} = require("./seedHelper");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("connected to db")
    })
    .catch((error) => {
        console.log("error = " + error);
    });


const randomItemFromArray = (array) => array[Math.floor(Math.random() * array.length)];

const randomLocation = function () {
    const random1000 = Math.floor((Math.random() * 1000) + 1);

    const city = cities[random1000].city;
    const state = cities[random1000].state;
    return `${city}, ${state}`;
}

const randomPrice = () => {
    return Math.floor((Math.random() * 50) + 1);
}

function randomCoordinates() {
    const random1000 = Math.floor((Math.random() * 1000) + 1);

    const latitude = cities[random1000].latitude;
    const longitude = cities[random1000].longitude;
    return [longitude, latitude];
}

(async function () {
    // Reset the campgrounds (delete all the existing items)
    await Campground.deleteMany({});

    // Create 50 campgrounds
    for (let i = 0; i <= 50; i++) {
        const camp = new Campground({
            location: randomLocation(),
            title: `${randomItemFromArray(descriptors)} ${randomItemFromArray(places)}`,
            images: [
                {filename: "YelpCamp/n7wc8lwz7bdkgnizk1rx", url: "https://res.cloudinary.com/dkwnlbdiy/image/upload/v1622288123/YelpCamp/n7wc8lwz7bdkgnizk1rx.jpg"},
                {filename: "YelpCamp/ycza308blqlxewfoavk6", url: "https://res.cloudinary.com/dkwnlbdiy/image/upload/v1622486280/YelpCamp/wh3wlkktkoqzcixqos2j.jpg"}
            ],
            geometry:{
                type:"Point",
                coordinates: randomCoordinates()
            },
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium amet cupiditate ex, id ipsa iusto laborum minima nulla quis reiciendis saepe soluta totam, unde veritatis voluptate, voluptates voluptatibus! Facere, nobis!",
            price: randomPrice(),
            author: "60abe90286f9400f44a02ca7"
        })

        // Save to DB
        await camp.save();
    }

})().then(() => {
    mongoose.connection.close();
});

