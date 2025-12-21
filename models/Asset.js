const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    assetName: {
        type: String,
        required: true,
        trim: true,
    },
    assetType: { 
        type: String, 
        required: true,
        enum: ['Returnable', 'Non-returnable'], 
    },
    quantity: {
        type: Number,
        required: true,
        min: 0, // Changed to 0 so assets can go "Out of Stock"
    },
    // Used for HR dashboard analytics
    stockStatus: { 
        type: String,
        enum: ['Available', 'Out of Stock'],
        default: 'Available',
    },
    companyName: { 
        type: String,
        required: true,
        index: true,
    },
    addedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // To track how many times this specific asset was requested
    requestCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware
assetSchema.pre('save', function(next) {
    this.stockStatus = this.quantity > 0 ? 'Available' : 'Out of Stock';
    next();
});

module.exports = mongoose.model('Asset', assetSchema);