const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User'); 
const assetRoutes = require('./routes/assetRoutes');
const requestRoutes = require('./routes/requestRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Veridium MongoDB connected'))
  .catch(err => console.error('Connection error:', err));

// --- Security Middlewares ---

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Unauthorized: Missing Token' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).send({ message: 'Forbidden: Invalid Token' });
        req.decoded = decoded;
        next();
    });
};

// --- Routes ---

app.post('/jwt', async (req, res) => {
    const user = req.body; 
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
    res.send({ token });
});

app.post('/users', async (req, res) => {
    const user = req.body;
    try {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) return res.send({ message: 'User exists', insertedId: null });
        
        if (user.role === 'hr') {
            user.packageLimit = 5; 
            user.currentEmployees = 0;
            user.subscription = 'basic';
        } else {
            user.role = 'employee'; 
        }

        const newUser = new User(user);
        const result = await newUser.save();
        res.status(201).send({ insertedId: result._id });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET user role - Fixed to return role: null instead of 404 to stop frontend errors
app.get('/users/role/:email', verifyToken, async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        
        if (!user) {
            // Returning 200 with role
            return res.send({ role: null, message: "User not in database" });
        }
        
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

app.use('/assets', assetRoutes);
app.use('/requests', requestRoutes);
app.use('/payments', paymentRoutes);
app.use('/stats', statsRoutes);

app.get('/', (req, res) => res.send('Veridium API is Active'));

app.listen(port, () => console.log(`Server running on port ${port}`));