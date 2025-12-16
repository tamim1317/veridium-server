const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Payment {
    static collectionName = 'payments';

    constructor(
        hrManagerId,        // ObjectId of the HR Manager who initiated payment
        companyName,
        packageType,        // e.g., '5 Assets', '10 Assets', 'Unlimited'
        maxAssets,          // Numerical limit based on package
        status,             // e.g., 'Active', 'Expired', 'Trial'
        transactionId,      // ID from payment gateway (Stripe/PayPal)
        paymentAmount,
        expiryDate
    ) {
        this.hrManagerId = new ObjectId(hrManagerId);
        this.companyName = companyName;
        this.packageType = packageType;
        this.maxAssets = maxAssets;
        this.status = status;
        this.transactionId = transactionId;
        this.paymentAmount = paymentAmount;
        this.startDate = new Date();
        this.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    static getCollection() {
        return getDB().collection(this.collectionName);
    }

    // Static method to get the current active package for a company
    static async findActivePackage(companyName) {
        return this.getCollection().findOne({ 
            companyName: companyName, 
            status: 'Active' 
        });
    }
}

module.exports = Payment;