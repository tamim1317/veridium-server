const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');

//Add a New Asset (HR Only)
const addAsset = async (req, res) => {
    try {
        const db = await connectDB();
        const assetsCollection = db.collection('assets');
        
        const { productName, productType, productQuantity } = req.body;
        const hrEmail = req.user.email; // From verifyToken

        const newAsset = {
            productName,
            productType,
            productQuantity: parseInt(productQuantity),
            availableQuantity: parseInt(productQuantity),
            dateAdded: new Date(),
            hrEmail,
            companyName: req.body.companyName
        };

        const result = await assetsCollection.insertOne(newAsset);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: "Failed to add asset" });
    }
};

//Asset List with Pagination & Search (HR Only)
const getHRAssets = async (req, res) => {
    try {
        const db = await connectDB();
        const assetsCollection = db.collection('assets');
        
        const hrEmail = req.user.email;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        const query = {
            hrEmail: hrEmail,
            productName: { $regex: search, $options: 'i' }
        };

        const assets = await assetsCollection.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ dateAdded: -1 })
            .toArray();

        const totalAssets = await assetsCollection.countDocuments(query);

        res.json({
            assets,
            totalPages: Math.ceil(totalAssets / limit),
            currentPage: page,
            totalItems: totalAssets
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching assets" });
    }
};

module.exports = { addAsset, getHRAssets };