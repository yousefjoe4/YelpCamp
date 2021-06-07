const express = require("express")
const router = express.Router();
const {isLoggedIn, isCurrentUserOwnerOfCampground, validateCampground} = require("../middleware")
const controller = require("../controllers/campgrounds")
const multer = require('multer')
const {storage} = require("../cloudinary/index")

const upload = multer({storage: storage})

router.route("/")
    .get(controller.indexCampgrounds)
    .post(isLoggedIn,upload.array('image'), validateCampground, controller.createCampground)

router.get("/new", isLoggedIn, controller.renderNewCampgroundForm);

router.route("/:id")
    .get(controller.showCampground)
    .put(isLoggedIn, isCurrentUserOwnerOfCampground, upload.array('image'), validateCampground, controller.updateCampground)
    .delete(isLoggedIn, isCurrentUserOwnerOfCampground, controller.deleteCampground);

router.get("/:id/edit", isLoggedIn, isCurrentUserOwnerOfCampground, controller.renderEditCampgroundForm);

module.exports = router;