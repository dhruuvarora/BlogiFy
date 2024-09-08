// index.js
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const { checkforAuthenicationCookie } = require("./middlewares/auth");

const app = express();
const PORT = 8000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/blogiFy", { useNewUrlParser: true, useUnifiedTopology: true })
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
app.use(checkforAuthenicationCookie("token"));

// Routes
app.get("/", async (req, res) => {
    try {
        const allBlogs = await Blog.find({});
        res.render("home", {
            user: req.user,  // This will be passed from the middleware
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
    console.log(`Server started at ${PORT}`);
});
