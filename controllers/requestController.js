const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');

//Create a Request (Employee Side)
const createRequest = async (req, res) => {
    try {
        const db = await connectDB();
        const { assetId, note } = req.body;
        const requesterEmail = req.user.email;
        const requesterName = req.user.name;

        const asset = await db.collection('assets').findOne({ _id: new ObjectId(assetId) });
        if (!asset || asset.availableQuantity < 1) {
            return res.status(400).json({ message: "Asset unavailable" });
        }

        const newRequest = {
            assetId: new ObjectId(assetId),
            assetName: asset.productName,
            assetType: asset.productType,
            requesterEmail,
            requesterName,
            hrEmail: asset.hrEmail,
            companyName: asset.companyName,
            requestDate: new Date(),
            status: "pending",
            note
        };

        const result = await db.collection('requests').insertOne(newRequest);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: "Request failed" });
    }
};

//Approve Request (HR Side)
const approveRequest = async (req, res) => {
    const session = (await connectDB()).client.startSession();
    try {
        const db = await connectDB();
        const requestId = req.params.id;
        const hrEmail = req.user.email;

        const request = await db.collection('requests').findOne({ _id: new ObjectId(requestId) });
        if (!request) return res.status(404).json({ message: "Request not found" });

        //Check HR's current employee limit
        const hrUser = await db.collection('users').findOne({ email: hrEmail });
        const employeeExists = await db.collection('affiliations').findOne({ 
            employeeEmail: request.requesterEmail, 
            hrEmail: hrEmail 
        });

        //If employee is new to this company, check package limit
        if (!employeeExists) {
            if (hrUser.currentEmployees >= hrUser.packageLimit) {
                return res.status(400).json({ 
                    message: "Package limit reached. Please upgrade your subscription." 
                });
            }
        }

        //Start Transactional Updates
        await db.collection('requests').updateOne(
            { _id: new ObjectId(requestId) },
            { $set: { status: "approved", approvalDate: new Date() } }
        );

        await db.collection('assets').updateOne(
            { _id: request.assetId },
            { $inc: { availableQuantity: -1 } }
        );

        //Create Affiliation and update HR count if first time
        if (!employeeExists) {
            await db.collection('affiliations').insertOne({
                employeeEmail: request.requesterEmail,
                employeeName: request.requesterName,
                hrEmail: hrEmail,
                companyName: request.companyName,
                affiliationDate: new Date()
            });
            await db.collection('users').updateOne(
                { email: hrEmail },
                { $inc: { currentEmployees: 1 } }
            );
        }

        res.json({ message: "Request approved and employee affiliated!" });
    } catch (error) {
        res.status(500).json({ message: "Approval logic failed" });
    }
};

module.exports = { createRequest, approveRequest };