const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review")

const imageSchema = new Schema({filename: String, url: String})

imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_300") // get the picture with just 300 width
})

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type:{
            type: String,
            enum:["Point"],
            required:true
        },
        coordinates:{
            type: [Number],
            required: true
        }
    },
    images: [imageSchema],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }]
}, {toJSON: {virtuals: true}, toObject: { virtuals: true },
});

campgroundSchema.post("findOneAndDelete", async (deletedCampground) => {
    if (deletedCampground) {
        // DELETE all the campgrounds reviews from the reviews table
        await Review.deleteMany({_id: {$in: deletedCampground.reviews}})
    }
})

campgroundSchema.virtual("properties.popUpMarkup").get(function(){
    return `${this.title}<br> <a href="/campgrounds/${this.id}">View</a>
            <p>${this.description.substr(0,30)}...</p>`
})

module.exports = mongoose.model("Campground", campgroundSchema);