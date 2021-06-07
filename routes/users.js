const express = require("express");
const router = express.Router()
const passport = require("passport")
const controller = require("../controllers/users")
const {isTryingToLoginAgain} = require("../middleware")

function loginUser() {
    return passport.authenticate('local',
        {failureRedirect: "/user/login", failureFlash: true})
}

router.route("/register")
    .get(isTryingToLoginAgain, controller.renderRegisterForm)
    .post(isTryingToLoginAgain, controller.registerUser);

router.route("/login")
    .get(isTryingToLoginAgain, controller.renderLoginForm)
    .post(isTryingToLoginAgain, loginUser(), controller.afterUserLoggedIn);

router.get("/logout", controller.logoutUser)

module.exports = router