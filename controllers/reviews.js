const asyncCatch = require("../utils/asnycCatch")
const Review = require("../models/review")
const Campground = require("../models/campground");

module.exports.createReview = asyncCatch(async (req, res) => {
    const campgroundId = req.params.id;

    // find campground
    const campground = await Campground.findById(campgroundId);

    // create a review and add attach it to the campground
    const review = new Review(req.body.review);
    review.author = req.user
    campground.reviews.push(review)

    await review.save()
    await campground.save()

    req.flash("success", "Thanks for your review!")


    res.redirect(`/campgrounds/${campgroundId}`)

});


    module.exports.deleteReview = asyncCatch(async (req, res) => {
    const {id, reviewId} = req.params;

    // find campground and update it by pulling the reviewId from the reviews
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});

    // Delete the Review from the reviews table
    await Review.findByIdAndDelete(reviewId)

    req.flash("success", "Successfully deleted the review!")

    res.redirect(`/campgrounds/${id}`)
});
