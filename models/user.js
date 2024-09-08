// models/user.js

const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }, 
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: "./Images/avatar.png",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
}, 
{ timestamps: true });

userSchema.pre("save", function(next) {
    const user = this;

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) return next();

    // Generate a salt and hash the password
    const salt = randomBytes(16).toString("hex"); // Specifying "hex" encoding

    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");
    
    // Set the salt and hashed password on the user document
    this.salt = salt;
    this.password = hashedPassword;

    next();
});

userSchema.static("matchPasswordAndGenerateToken", async function(email, password) {
    // Find the user by email
    const user = await this.findOne({ email });
    if (!user) throw new Error('User not found!');

    // Get the salt from the user document
    const salt = user.salt;

    // Hash the provided password with the same salt
    const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    // Compare the hashed password
    if (user.password !== userProvidedHash) throw new Error('Incorrect Password');

    // Return the user object without password and salt
    // return { ...user.toObject(), password: undefined, salt: undefined };

    const token = createTokenForUser(user);
    return token;
});


const User = model('User', userSchema);
module.exports = User;
