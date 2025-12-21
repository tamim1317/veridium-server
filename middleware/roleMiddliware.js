const { connectDB } = require('../config/db');

const verifyHR = async (req, res, next) => {
    try {
        const email = req.decoded?.email;
        
        if (!email) {
            return res.status(401).send({ message: 'Unauthorized: User email not found in token' });
        }

        const db = await connectDB();
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ email: email });

        if (!user || user.role !== 'hr') {
            return res.status(403).send({ 
                message: 'Forbidden: You do not have HR Manager permissions' 
            });
        }

        req.userRole = user.role;
        
        next();
    } catch (error) {
        console.error('Role Verification Error:', error);
        res.status(500).send({ message: 'Internal Server Error during role verification' });
    }
};

module.exports = { verifyHR };