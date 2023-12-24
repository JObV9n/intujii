// app.js
const express = require("express");
const app = express();

const file= require('fs/promises');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var blogs = [];
app.get("/", (req, res) => {
  console.log("In Homepage");
  res.send(`Welcome to the Homepage , 
    To visit to the api use "/api/blogs" ,
    to visit blogs with id use "/api/blogs/id."`);
});

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
//

//load blogs from json
async function loadBlogs(){
    try{
        const allBlogs= await file.readFile('blogs.json','utf-8');
        blogs= JSON.parse(allBlogs);
    }catch (e){
        console.log('Error loading the blogs: ',e.message);
    }
}

// save the blogs 
async function saveBlogs() {
    try {
      await file.writeFile('blogs.json', JSON.stringify(blogs, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving blogs:', error.message);
    }
  }

  loadBlogs();

// GET all blogs
app.get("/api/blogs", (req, res) => {
  res.json(blogs);
});

// GET a single blog by ID
app.get("/api/blogs/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const blog = blogs.find((blog) => blog.id === id);

  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

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

    //creating new blog on every new post request
    newBlog.id = blogs.length + 1;
    blogs.push(newBlog);
    // res.status(201).json(newBlog);
    res.send(`blog with the title "${newBlog.title}" has been created`)
    console.log("New blog added.\n");
    
    console.log(req.body);
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
      return res.status(404).json({ error: "Blog not found" });
    }

    blogs[index] = { ...blogs[index], ...updatedBlog }; //use of Spread operator rather than Set
    res.json(blogs[index]);
    console.log(`Blog with title:"${updatedBlog.title}" has been updated`);

  } catch (error) {
    next(error);
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


