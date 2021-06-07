const express = require("express")
const router = express.Router({mergeParams:true});
const {isLoggedIn,isCurrentUserOwnerOfReview, validateReview} = require("../middleware")
const controller = require("../controllers/reviews")

router.post("/", isLoggedIn, validateReview, controller.createReview)

router.delete("/:reviewId", isLoggedIn,isCurrentUserOwnerOfReview, controller.deleteReview)

module.exports = router;