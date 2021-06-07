const mongoose = require("mongoose")
// const passportLocalMongoose =  require("passport-local-mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {
        type: String,
        required: [true, "Must have an email"],
        unique: true,
    }
})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12)
    }
    next()
})


userSchema.statics.findByUsernameAndValidate = async function (username, password) {
    const user = await this.findOne({username: username})

    if (!user) return false

    const passwordMatches = await bcrypt.compare(password, user.password);

    return passwordMatches ? user : false;
}

module.exports = mongoose.model("User", userSchema);