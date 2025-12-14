const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    // Link to the user who owns/controls this asset (the HR Manager/Company)
    hrManagerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // The employee currently assigned to this asset
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Null if unassigned
    },
    name: {
        type: String,
        required: [true, 'Asset name is required'],
        trim: true,
    },
    assetType: {
        type: String,
        required: [true, 'Asset type is required'],
        enum: ['Laptop', 'Mobile', 'Monitor', 'Vehicle', 'Other'],
    },
    serialNumber: {
        type: String,
        unique: true,
        required: [true, 'Serial number is required'],
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Available', 'Assigned', 'Under Maintenance', 'Retired'],
        default: 'Available',
    },
}, { timestamps: true });

module.exports = mongoose.model('Asset', AssetSchema);