const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    assetId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Asset', 
        required: true 
    },
    assetName: String,
    assetType: String,
    requestDate: { type: Date, default: Date.now },
    approvalDate: Date,
    requestStatus: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected', 'Returned'], 
        default: 'Pending' 
    },
    requesterEmail: { type: String, required: true },
    requesterName: String,
    hrEmail: { type: String, required: true }, // To show requests to the right HR
    note: String, // Optional message from employee
});

module.exports = mongoose.model('Request', requestSchema);