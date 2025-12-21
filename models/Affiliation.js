const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class EmployeeAffiliation {
    static collectionName = 'employeeAffiliations';

    constructor(
        employeeId,          // ObjectId of the Employee (requester)
        hrManagerId,         // ObjectId of the HR Manager
        companyName,
        status               // 'Pending', 'Approved', 'Rejected' (Approval status for Employee Registration)
    ) {
        this.employeeId = new ObjectId(employeeId);
        this.hrManagerId = new ObjectId(hrManagerId);
        this.companyName = companyName;
        this.status = status; 
        this.createdAt = new Date();
    }

    static getCollection() {
        return getDB().collection(this.collectionName);
    }

    // Static method to find all pending requests for a specific HR manager
    static async findPendingByHR(hrManagerId) {
        return this.getCollection().find({ 
            hrManagerId: new ObjectId(hrManagerId), 
            status: 'Pending' 
        }).toArray();
    }
}

module.exports = EmployeeAffiliation;