const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models
const User = require('./models/User'); 

// Routes (Assuming you have modularized them for cleanliness)
const assetRoutes = require('./routes/assetRoutes');
const requestRoutes = require('./routes/requestRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Veridium MongoDB connected via Mongoose'))
  .catch(err => console.error('❌ Connection error:', err));

// --- Security Middlewares ---

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Unauthorized access: No token' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access: Invalid token' });
        }
        req.decoded = decoded;
        next();
    });
};

const verifyHR = async (req, res, next) => {
    const email = req.decoded?.email;
    const user = await User.findOne({ email });
    if (user?.role !== 'hr') {
        return res.status(403).send({ message: 'Forbidden: HR Manager access required' });
    }
    next();
};

// --- Authentication Routes ---

// JWT Generation
app.post('/jwt', async (req, res) => {
    try {
        const user = req.body; 
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
        res.send({ token });
    } catch (error) {
        res.status(500).send({ message: "JWT Generation Failed" });
    }
});

// Save User (Registration Logic with Role-Specific Defaults)
app.post('/users', async (req, res) => {
    const user = req.body;
    try {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
            return res.send({ message: 'User already exists', insertedId: null });
        }
        
        // HR specific logic
        if (user.role === 'hr') {
            user.packageLimit = 5;      // Default for HR
            user.currentEmployees = 0;
            user.subscription = 'basic';
        } else {
            user.role = 'employee';     // Default for others
        }

        const newUser = new User(user);
        const result = await newUser.save();
        res.status(201).send({ insertedId: result._id });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Get User Role & Data (Used by AuthProvider on refresh)
app.get('/users/role/:email', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).send({ role: null });
        
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

// --- Functional Routes ---
app.use('/assets', assetRoutes);
app.use('/requests', requestRoutes);
app.use('/payments', paymentRoutes);
app.use('/stats', statsRoutes);

// --- Base Routes ---
app.get('/', (req, res) => res.send('Veridium API is Active and Secure '));

// 404 Handler
app.use((req, res) => res.status(404).send({ message: 'Route not found' }));

app.listen(port, () => console.log(`💻 Server running on port ${port}`));