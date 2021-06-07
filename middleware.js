const {campgroundSchema, reviewsSchema} = require("./schemas")
const ExpressError = require("./utils/ExpressError")
const Campground = require("./models/campground");
const Review = require("./models/review")


module.exports.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        next()
    } else {
        req.flash("error","You need to be logged in!")

        // Redirect to the url the user was originally requesting
        if(req.method === "GET"){
        req.session.redirectTo = req.originalUrl
        }
        res.redirect("/user/login")
    }
}

module.exports.isTryingToLoginAgain = function(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/campgrounds")
    }
    next()
}

module.exports.isCurrentUserOwnerOfCampground = async function isCurrentUserOwnerOfCampground(req,res,next){
    const {id} = req.params;
    const campground = await Campground.findById(id).populate("author")

    // Check if the currentUser owns this campground
    if(campground.author.id === req.user.id){
        next()
    }else {
        req.flash("error","You don't have the permission to do that!")
        res.redirect(`/campgrounds/${campground.id}`)
    }
}


module.exports.validateCampground = function (req, res, next) {
    // validate the data, and extract the error part out of it
    const {error} = campgroundSchema.validate(req.body)
    if (error) {
        // get all errors and combine them
        const errorMessages = error.details.map(element => element.message).join(",")
        throw new ExpressError(400, errorMessages)
    } else {
        // if there is no error, continue to the next route
        next()
    }
}


// Reviews


module.exports.isCurrentUserOwnerOfReview = async function(req,res,next){
    // get the campground and reviewId
    const {id, reviewId} = req.params;

    // Get the review
    const review = await Review.findById(reviewId).populate("author")

    // Check if the author of the review is the current user
    if(review.author.id === req.user.id){
        next()
    } else {
        req.flash("error","You don't have the permission to do that!")
        res.redirect(`/campgrounds/${id}`)
    }
}

module.exports.validateReview = function (req, res, next) {
    const {error} = reviewsSchema.validate(req.body)
    if (error) {
        // get all errors and combine them
        const errorMessages = error.details.map(element => element.message).join(",")
        throw new ExpressError(400, errorMessages)
    } else {
        next()
    }
}
