const asyncCatch = require("../utils/asnycCatch")
const User = require("../models/user")

module.exports.renderRegisterForm = (req, res) => {
    res.render("user/register")
}
module.exports.renderLoginForm = (req, res) => {
    res.render("user/login")
}
module.exports.registerUser = asyncCatch(async (req, res) => {
    const user = new User(req.body)
    await user.save()
    req.login(user, () => res.redirect("/campgrounds"))
})

module.exports.afterUserLoggedIn = (req, res) => {
    // If the user was trying to access a different url before signing in:
    // redirect them to where they were trying to go after they log in
    const url = req.session.redirectTo || "/campgrounds";

    console.log(url)

    // logged in already
    res.redirect(url)
}

module.exports.logoutUser = (req, res) => {
    if (req.isAuthenticated()) {
        req.logout()
        req.flash("success", "Logged out successfully!")
        res.redirect("/campgrounds")
    } else {
        res.redirect("/campgrounds")
    }
}