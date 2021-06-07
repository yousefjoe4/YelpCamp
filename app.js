if(process.env.NODE_ENV !=="production"){
    require("dotenv").config()
}

const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError")
const reviewsRouter = require("./routes/reviews")
const usersRouter = require("./routes/users")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require('passport-local');
const User = require("./models/user")
const campgroundsRouter = require("./routes/campgrounds")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const oneWeekMillSeconds = (1000 * 60 * 60 * 24 * 7)
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
const secret = process.env.SECRET || "thisShouldChange!";

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
app.use(mongoSanitize({replaceWith: "_"})) // prevent mongo injection (replaces any keys that starts with $ or . with _ )


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dkwnlbdiy/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const mongoStoreOptions = {
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60 // time period in seconds
}
const sessionConfig = {
    store: MongoStore.create(mongoStoreOptions),
    name:"session",
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + oneWeekMillSeconds,
        maxAge: oneWeekMillSeconds,
    }
}
app.use(session(sessionConfig))

// init passport
passport.use(new LocalStrategy(
    {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,

    },
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

passport.serializeUser((user,done) => done(null, user.id))

passport.deserializeUser(async(id,done) => done(null,await User.findById(id)))

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


app.get("/",(req, res) => {
    res.render("home");
});



app.all("*", (req, res, next) => {
    throw new ExpressError(404, "404 Page Not Found!");
})

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