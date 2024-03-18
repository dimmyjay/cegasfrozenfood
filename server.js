// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

// MongoDB connection URI (replace <username>, <password>, <dbname> with your MongoDB credentials)
const mongoURI = 'mongodb+srv://dimejifalayi:123JONATHANola@cegasfrozenfood.a0jw4a2.mongodb.net/';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define a schema for the user collection
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Create a MongoDB model based on the schema
const UserModel = mongoose.model('User', UserSchema);

// Define a schema for the frozen food collection
const FrozenFoodSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: String, // Store the path to the image
});

// Create a MongoDB model based on the schema
const FrozenFoodModel = mongoose.model('FrozenFood', FrozenFoodSchema);

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Define the destination folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Define the filename (use current timestamp + original extension)
  }
});

// Initialize multer upload middleware
const upload = multer({ storage });

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to handle CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Route to handle user registration (signup)
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new UserModel({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to handle user login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });

    // Return user ID and token in the response
    res.status(200).json({ userId: user._id, token });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Route to handle adding frozen food data
// Route to handle adding frozen food data
app.post('/api/addfrozenfood', upload.single('image'), async (req, res) => {
    try {
      const { name, price, category } = req.body;
      let image = req.file.path; // Get the path of the uploaded image
  
      // Normalize the path by replacing backslashes with forward slashes
      image = image.replace(/\\/g, '/');
  
      // Create a new frozen food document
      const newFrozenFood = new FrozenFoodModel({
        name,
        price,
        category,
        image,
      });
  
      // Save the new frozen food to the database
      await newFrozenFood.save();
  
      res.status(201).json({ message: 'Frozen food added successfully' });
    } catch (error) {
      console.error('Error adding frozen food:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

// Route to fetch frozen food data
app.get('/api/frozenfoods', async (req, res) => {
    try {
      const { category } = req.query; // Get the category parameter from the query string
      let query = {}; // Define an empty query object
  
      // If category parameter is provided, filter by category
      if (category) {
        query = { category }; // Set the query object to filter by the provided category
      }
  
      // Fetch frozen foods based on the query
      const frozenFoods = await FrozenFoodModel.find(query);
      res.status(200).json(frozenFoods);
    } catch (error) {
      console.error('Error fetching frozen foods:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // Define upload endpoint
app.post('/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrl = req.file.path; // Path to the uploaded image
  // You can now save this image URL to a database or use it in your application as needed

  res.status(200).json({ imageUrl });
});
// Start the server
// Define the image schema
const imageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
});

// Create the ImageModel using the schema
const ImageModel = mongoose.model('Image', imageSchema);
// Initial image data
const data = [
  { id: '1', image: 'https://oloja.ng/wp-content/uploads/2020/04/Whole-Turkey-Frozen-1536x1024.jpg', price: '$5.99', description: 'Delicious Frozen Food - Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '2', image: 'https://th.bing.com/th/id/R.0ba024ef583f9f6ceab2d0086afd30ea?rik=Un0YTLWbTPilQQ&riu=http%3a%2f%2fdayoadetiloye.com%2fwp-content%2fuploads%2f2017%2f04%2fFROZEN-FOODS-BUSINESS-PLAN-IN-NIGERIA-1.jpg&ehk=1lSzGIIvfiw4qjS6YZPem%2fxeqFaqoSDj2EEUY9PLD%2bw%3d&risl=&pid=ImgRaw&r=0', price: '$4.49', description: 'Tasty Frozen Food - Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '3', image: 'https://th.bing.com/th/id/R.31058df8a6eec79561c9ac153835cca8?rik=Lh6Z4Hu7NkFLqg&pid=ImgRaw&r=0', price: '$6.99', description: 'Yummy Frozen Food - Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '4', image: 'https://bradleysfish.com/wp-content/uploads/2021/05/Hen-Crabs-Cooked-5-600g1-Custom-1-768x633.jpg', price: '$3.99', description: 'Scrumptious Frozen Food - Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
];

const saveImageDataToDatabase = async () => {
  try {
    await ImageModel.deleteMany(); // Clear existing data
    await ImageModel.insertMany(data); // Insert new data
    console.log('Image data saved to database');
  } catch (error) {
    console.error('Error saving image data to database:', error);
  }
};

// Save initial image data to the database
// Save initial image data to the database when a request is made to '/api/images'
app.post('/api/images', async (req, res) => {
  try {
    // Call the function to save initial image data to the database
    await saveImageDataToDatabase();
    res.status(201).json({ message: 'Image data saved successfully' });
  } catch (error) {
    console.error('Error saving image data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to fetch image data from the database
app.get('/api/images', async (req, res) => {
  try {
    const imageData = await ImageModel.find();
    res.json(imageData);
  } catch (error) {
    console.error('Error fetching image data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
