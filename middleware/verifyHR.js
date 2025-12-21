const { connectDB } = require('../config/db');

const verifyHR = async (req, res, next) => {
    try {
        const email = req.decoded?.email;
        const db = await connectDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: email });

        if (!user || user.role !== 'hr') {
            return res.status(403).send({ message: 'Forbidden access: HR Manager role required' });
        }

        next();
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error in Role Verification' });
    }
};

module.exports = verifyHR;