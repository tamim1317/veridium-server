const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: { // Stored HASHED
        type: String,
        required: true,
    },
    role: { // 'hr' or 'employee'
        type: String,
        enum: ['hr', 'employee'],
        required: true,
    },
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    status: { // 'approved' (default for HR), 'pending' (for new employees)
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'approved',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);