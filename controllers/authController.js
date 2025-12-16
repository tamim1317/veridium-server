const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// HR Manager registers a new company (Existing function)
const registerHrManager = async (req, res) => {
    // ... (Existing code for registration) ...
};

// Login function for both HR and Employee
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try {
        // 2. Find the user by email
        const user = await User.getCollection().findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 4. Generate the JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, // Payload (data inside the token)
            process.env.JWT_SECRET,            // Secret key from .env
            { expiresIn: '7d' }                // Token expiration
        );

        // 5. Send the token and user data back
        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName,
            }
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = {
    registerHrManager,
    loginUser, // <-- Export the new function
};