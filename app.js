if(process.env.NODE_ENV !=="production"){
    require("dotenv").config()
}
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError")
const reviewsRouter = require("./routes/reviews")
const usersRouter = require("./routes/users")
const session = require("express-session")
const sessionConfig = require("./utils/session-config")
const flash = require("connect-flash")
const passport = require("passport")
const passportInitialize = require("./utils/passport-config")
const campgroundsRouter = require("./routes/campgrounds")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const helmetContentSecurityConfig = require("./utils/helmet-content-sec-config")
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

connectToDB();

// Serve the content on the @port
app.listen(port, () => {
    console.log(`listening on port ${port}...`)
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"));
app.use(express.static("public"))
app.use(flash())

// Security
app.use(mongoSanitize({replaceWith: "_"})) // prevent mongo injection (replaces any keys that starts with $ or . with _ )
app.use(helmet.contentSecurityPolicy(helmetContentSecurityConfig));

app.use(session(sessionConfig(dbUrl)))

passportInitialize()
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.user = req.user;
    next()
})


// Set the routes
app.use("/campgrounds/:id/reviews", reviewsRouter)
app.use("/campgrounds", campgroundsRouter)
app.use("/user", usersRouter)
app.get("/",(req, res) => res.render("home"))


// Default route
app.all("*", (req, res, next) => {
    throw new ExpressError(404, "404 Page Not Found!");
})

// Errors Middleware
app.use((err, req, res, next) => {
    console.log("--------------------Error-----------------------")
    console.log(err)
    console.log("------------------------------------------------")
    const {status = 500} = err;
    if (!err.message) err.message = "An error has occurred"
    res.status(status).render("errors", {err})
});


function connectToDB() {
    mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
        .then(() => {
            console.log("connected to db")
        })
        .catch((error) => {
            console.log("error = " + error);
        });
}