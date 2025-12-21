const jwt = require('jsonwebtoken');
const { connectDB } = require('../config/db');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; 
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
    }
};


const verifyHR = async (req, res, next) => {
    const email = req.user?.email;

    try {
        const db = await connectDB();
        const usersCollection = db.collection('users');
        
        const user = await usersCollection.findOne({ email: email });

        if (user && user.role === 'hr') {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: HR Manager access required.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error in Role Verification' });
    }
};

module.exports = { verifyToken, verifyHR };