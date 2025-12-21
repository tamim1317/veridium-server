const { connectDB } = require('../config/db');
const jwt = require('jsonwebtoken');

//Register HR Manager
const registerHR = async (req, res) => {
    try {
        const db = await connectDB();
        const usersCollection = db.collection('users');
        const userData = req.body;

        const existingUser = await usersCollection.findOne({ email: userData.email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newHR = {
            ...userData,
            role: "hr",
            packageLimit: 5,
            currentEmployees: 0,
            subscription: "basic",
            createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newHR);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Register Employee
const registerEmployee = async (req, res) => {
    try {
        const db = await connectDB();
        const usersCollection = db.collection('users');
        const userData = req.body;

        const existingUser = await usersCollection.findOne({ email: userData.email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newEmployee = {
            ...userData,
            role: "employee",
            createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newEmployee);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Generate JWT (Login)
const loginUser = async (req, res) => {
    const { email } = req.body;
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign(
        { email: user.email, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
    );

    res.send({ token });
};

module.exports = { registerHR, registerEmployee, loginUser };