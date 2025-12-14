const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to create JWT
const createToken = (email, role) => {
    return jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// HR Registration
const hrRegister = async (req, res) => {
    const { name, email, password, companyName, companyLogo } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPassword, companyName, companyLogo,
            role: 'hr',
            packageLimit: 5, 
            currentEmployees: 0,
            subscription: 'basic'
        });
        const token = createToken(user.email, user.role);
        res.status(201).json({ user, token });
    } catch (error) {
        // Handle duplicate email error
        res.status(500).json({ message: 'Registration failed.', error: error.message });
    }
};

// Employee Registration
const employeeRegister = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPassword, 
            role: 'employee'
        });
        const token = createToken(user.email, user.role);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed.', error: error.message });
    }
};

// Login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

        const token = createToken(user.email, user.role);
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Login failed.', error: error.message });
    }
};

module.exports = { hrRegister, employeeRegister, login };