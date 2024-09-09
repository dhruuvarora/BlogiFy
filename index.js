const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require('dotenv').config();  // Load environment variables

const Blog = require("./models/blog");
const User = require("./models/user");

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/blogiFy", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
app.use(checkForAuthenticationCookie("token"));

// Populate res.locals.user
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = {
      fullName: req.user.fullName,
      profileImageURL: req.user.profileImageURL
    };
  } else {
    res.locals.user = null;
  }
  next();
});

// Routes
app.get("/", async (req, res) => {
    try {
        const allBlogs = await Blog.find({});
        res.render("home", {
            blogs: allBlogs,
        });
    } catch (err) {
        console.error("Error fetching blogs:", err);
        res.status(500).send("Server Error");
    }
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);

// Start server
app.listen(PORT, () => {
    console.log(`Server started at PORT:${PORT}`);
});
