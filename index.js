const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Note: Ensure your './models/User' matches the schema we discussed
const User = require('./models/User'); 

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Veridium MongoDB connected.'))
  .catch(err => console.error('Connection error:', err));

// --- Security Middlewares ---

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    });
};

// Use this after verifyToken
const verifyHR = async (req, res, next) => {
    const email = req.decoded.email;
    const user = await User.findOne({ email });
    if (user?.role !== 'hr') {
        return res.status(403).send({ message: 'HR access only' });
    }
    next();
};

// --- Routes ---

// JWT Generation
app.post('/jwt', async (req, res) => {
    try {
        const user = req.body; // Expecting { email: '...' }
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        res.status(500).send({ message: "JWT Generation Failed" });
    }
});

// Save User (Registration)
app.post('/users', async (req, res) => {
    const user = req.body;
    try {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
            return res.send({ message: 'User exists', insertedId: null });
        }
        
        // Ensure role is strictly assigned
        if (!user.role) user.role = 'employee'; 

        const newUser = new User(user);
        const result = await newUser.save();
        res.send({ insertedId: result._id });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Get User Role & Data (For AuthContext)
app.get('/users/role/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.send({ role: null });
        
        // Return only what's necessary for the UI
        res.send({ 
            role: user.role, 
            companyName: user.companyName, 
            companyLogo: user.companyLogo,
            packageLimit: user.packageLimit 
        });
    } catch (error) {
        res.status(500).send({ message: "Server Error" });
    }
});



app.get('/', (req, res) => res.send('Veridium API is Active'));

app.listen(port, () => console.log(`Server on ${port}`));