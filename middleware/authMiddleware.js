const jwt = require('jsonwebtoken');

// JWT Verification
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; 
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// HR Role Verification
const verifyHR = (req, res, next) => {
    if (req.user && req.user.role === 'hr') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden. HR Manager access required.' });
    }
};

module.exports = { verifyToken, verifyHR };