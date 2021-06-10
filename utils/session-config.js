const oneWeekMillSeconds = (1000 * 60 * 60 * 24 * 7)
const secret = process.env.SECRET || "thisShouldChange!";
const MongoStore = require('connect-mongo');


module.exports = function (dbUrl) {
    const mongoStoreOptions = {
        mongoUrl: dbUrl,
        touchAfter: 24 * 60 * 60 // time period in seconds
    }

    return {
        store: MongoStore.create(mongoStoreOptions),
        name: "session",
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
}