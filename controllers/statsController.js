const { connectDB } = require('../config/db');

const getHRStats = async (req, res) => {
    try {
        const db = await connectDB();
        const hrEmail = req.user.email;

        //Pie Chart Data: Distribution of Asset Types
        const assetTypeData = await db.collection('assets').aggregate([
            { $match: { hrEmail: hrEmail } },
            { $group: { 
                _id: "$productType", 
                count: { $sum: "$productQuantity" } 
            } },
            { $project: { name: "$_id", value: "$count", _id: 0 } }
        ]).toArray();

        //Bar Chart Data: Top 5 Most Requested Assets
        const topRequestsData = await db.collection('requests').aggregate([
            { $match: { hrEmail: hrEmail } },
            { $group: { 
                _id: "$assetName", 
                requestCount: { $sum: 1 } 
            } },
            { $sort: { requestCount: -1 } },
            { $limit: 5 },
            { $project: { asset: "$_id", count: "$requestCount", _id: 0 } }
        ]).toArray();

        res.json({
            assetTypeData, // Format: [{name: 'Returnable', value: 10}, {name: 'Non-returnable', value: 5}]
            topRequestsData // Format: [{asset: 'Laptop', count: 12}, ...]
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch analytics data" });
    }
};

module.exports = { getHRStats };