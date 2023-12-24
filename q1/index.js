// app.js
const express = require("express");
const app = express();

const file = require('fs/promises');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the blogs array
let blogs = [];

// Home route
app.get("/", (req, res) => {
  console.log("In Homepage");
  res.send(
    `Welcome to the Homepage. To visit the API, use "/api/blogs". To visit blogs with an ID, use "/api/blogs/id."`,
  );
});

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Load blogs from JSON file when the server starts
async function loadBlogs() {
  try {
    const allBlogs = await file.readFile("blogs.json", "utf-8");
    blogs = JSON.parse(allBlogs);
  } catch (e) {
    console.log("Error in loading the blogs: ", e.message);
  }
}

// Save the blogs to the JSON file
async function saveBlogs() {
  try {
    await file.writeFile("blogs.json", JSON.stringify(blogs, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving blogs:", error.message);
  }
}

// Load blogs when the server starts
loadBlogs();

// GET all blogs
app.get("/api/blogs", (req, res) => {
  // Endpoint to get all blogs
  res.json(blogs);
});

// GET a single blog by ID
app.get("/api/blogs/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const blog = blogs.find((blog) => blog.id === id);

  if (!blog) {
    // Return a 404 response if the blog is not found
    return res.status(404).json({ error: "Blog not found" });
  }

  // Return the blog as JSON
  res.json(blog);
});

// POST a new blog
app.post("/api/blogs", (req, res, next) => {
  try {
    const newBlog = req.body;

    // Validate required fields
    if (!newBlog.title || !newBlog.description || !newBlog.category) {
      throw new Error("Title, description, and category are required");
    }

    // Creating new blog on every new post request
    newBlog.id = blogs.length + 1;
    blogs.push(newBlog);

    // Send a response indicating success and log the new blog
    res.send(`Blog with the title ${newBlog.title} has been created`);
    console.log("New blog added.\n");

    // Log the request body
    console.log(req.body);

    // Save blogs after adding a new blog
    saveBlogs();
  } catch (error) {
    next(error);
  }
});

// Update a blog by ID
app.put("/api/blogs/:id", (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updatedBlog = req.body;

    // Validate required fields
    if (
      !updatedBlog.title ||
      !updatedBlog.description ||
      !updatedBlog.category
    ) {
      throw new Error("Title, description, and category are required");
    }

    const index = blogs.findIndex((blog) => blog.id === id);

    if (index === -1) {
      // Return a 404 response if the blog is not found
      return res.status(404).json({ error: "Blog not found" });
    }

    // Update the blog using the spread operator
    blogs[index] = { ...blogs[index], ...updatedBlog };

    // Send the updated blog as JSON
    res.json(blogs[index]);

    // Save blogs after updating a blog
    saveBlogs();
  } catch (error) {
    next(error);
  }
});

//route to delete the blog using id
app.delete('/api/blogs/:id', (req, res) => {
  const blog= req.body;
  res.send(`Got a DELETE request at "${blog.title}"`)

  const blogId = parseInt(req.params.id);

  // Filter out the user with the specified ID
  blogs= blogs.filter(user => user.id !== blogId);

  // Check if any user was removed
  if (blogs.length < blogs.length + 1) {
    res.status(204).send(); // 204 No Content - successful deletion
  } else {
    res.status(404).json({ error: 'User not found' });
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


