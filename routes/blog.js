const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Blog = require("../models/blog");

const router = Router();

// Define the absolute path for the uploads directory
const uploadDir = path.resolve(__dirname, '../public/uploads');

// Check if directory exists and create it if it doesn't
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the absolute path for saving files
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Allow only image files (png, jpg, jpeg)
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5MB
});

// Route to render the "Add New Blog" form
router.get('/add-new', (req, res) => {
  return res.render('addBlog', {
    user: req.user,
  });
});

// Route to handle blog submission
router.post('/', upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;
    
    // Check if required fields are provided
    if (!title || !body) {
      return res.status(400).send("Title and body are required");
    }

    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).send("Cover image is required");
    }

    // Create a new blog post
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL: `/uploads/${req.file.filename}` // Save file path
    });
    
    // Redirect to the newly created blog's page
    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error creating blog:", err);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
