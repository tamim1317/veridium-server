const Asset = require('../models/Asset');

// 1. CREATE Asset (HR Only)
const createAsset = async (req, res) => {
    try {
        // HR Manager ID is taken from the verified JWT payload (req.user)
        const asset = await Asset.create({ 
            ...req.body, 
            hrManagerId: req.user.id // Link asset to the HR Manager creating it
        });
        res.status(201).json({ asset });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create asset.', error: error.message });
    }
};

// 2. READ Assets (HR can see all their assets, Employee can only see their assigned asset)
const getAssets = async (req, res) => {
    try {
        let filter = {};
        
        if (req.user.role === 'hr') {
            // HR sees all assets they manage
            filter.hrManagerId = req.user.id;
        } else if (req.user.role === 'employee') {
            // Employee only sees assets assigned to them
            filter.assignedTo = req.user.id;
        }

        const assets = await Asset.find(filter).populate('assignedTo', 'name email');
        res.status(200).json({ assets });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve assets.', error: error.message });
    }
};

// 3. UPDATE Asset (HR Only)
const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findOneAndUpdate(
            { _id: req.params.id, hrManagerId: req.user.id }, // Find by ID AND ensure HR owns it
            req.body,
            { new: true, runValidators: true }
        );

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found or unauthorized.' });
        }
        res.status(200).json({ asset });
    } catch (error) {
        res.status(400).json({ message: 'Failed to update asset.', error: error.message });
    }
};

// 4. DELETE Asset (HR Only)
const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findOneAndDelete({ 
            _id: req.params.id, 
            hrManagerId: req.user.id // Find by ID AND ensure HR owns it
        });

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found or unauthorized.' });
        }
        res.status(200).json({ message: 'Asset deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete asset.', error: error.message });
    }
};

module.exports = { createAsset, getAssets, updateAsset, deleteAsset };