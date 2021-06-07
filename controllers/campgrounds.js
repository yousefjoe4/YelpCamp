const Campground = require("../models/campground");
const asyncCatch = require("../utils/asnycCatch")
const {cloudinary} = require("../cloudinary/index")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({accessToken: process.env.MAPBOX_TOKEN});

module.exports.indexCampgrounds = asyncCatch(async (req, res) => {
    let campgrounds = await Campground.find();
    res.render("campgrounds/index", {campgrounds});
})

module.exports.renderNewCampgroundForm = asyncCatch(async (req, res) => {
    res.render("campgrounds/new");
})

module.exports.renderEditCampgroundForm = asyncCatch(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Product Not Found!")
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", {campground});
});


module.exports.showCampground = asyncCatch(async (req, res, next) => {
    try {
        const {id} = req.params
        const campground = await Campground.findById(id).populate({
            path: "reviews",
            populate: "author"
        }).populate("author");
        if (!campground) {
            req.flash("error", "Product Not Found!")
            return res.redirect("/campgrounds");
        }
        res.render("campgrounds/show", {campground});
    } catch (e) {
        next(e)
    }

})

// accepts something like "Istanbul, Turkey"
async function getGeometryOfLocation(location) {
    const result = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send()

    return result.body.features[0].geometry || [0,0];
}

module.exports.createCampground = asyncCatch(async (req, res) => {
    // add the current logged in user as the author of the campground
    req.body.campground.author = req.user
    const images = req.files.map(file => ({filename: file.filename, url: file.path}))
    const campground = new Campground(req.body.campground); // Same as title: title, location:location, image:image, etc.
    campground.images = images
    campground.geometry = await getGeometryOfLocation(campground.location)
    await campground.save();
    req.flash("success", "A new campground has been added")
    res.redirect(`/campgrounds/${campground.id}`)

})
module.exports.updateCampground = asyncCatch(async (req, res) => {
    const {id} = req.params
    const images = req.files.map(file => ({filename: file.filename, url: file.path}))
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, {new: true});
    campground.images.push(...images)

    campground.geometry = await getGeometryOfLocation(campground.location) // update the gemotery based on the new location

    if (req.body.deleteImages) {
        // remove the image from cloudinary
        for (let image of req.body.deleteImages) {
            cloudinary.uploader.destroy(image)
        }
        // remove the image from the database
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }

    req.flash("success", "Successfully update the campground!")
    res.redirect(`/campgrounds/${id}`);
})

module.exports.deleteCampground = asyncCatch(async (req, res) => {
    const {id} = req.params;

    await Campground.findByIdAndDelete(id)

    req.flash("success", "Successfully deleted the campground!")

    res.redirect(`/campgrounds`);
})