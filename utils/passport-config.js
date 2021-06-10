const passport = require("passport")
const LocalStrategy = require('passport-local');
const User = require("../models/user")

// init passport
module.exports = ()=>{
    passport.use(new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true,

        },
        // callback function for what to happen when the credentials are received
        async (req, username, password, done) => {
            const user = await User.findByUsernameAndValidate(username, password)
            if (user) {
                req.flash("success","Welcome Back!")
                done(null, user)
            } else {
                req.flash("error","Username or password is incorrect.")
                done(null, false)
            }
        }))

// How to save the user info to the session
    passport.serializeUser((user,done) => done(null, user.id))

// How to retrieve the user info from the session
    passport.deserializeUser(async(id,done) => done(null,await User.findById(id)))
}
