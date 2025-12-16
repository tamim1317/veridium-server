const { getDB } = require('../config/db');

class User {
    static collectionName = 'users';

    constructor(name, email, password, role, companyName) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;    
        this.companyName = companyName;
        this.status = 'approved';
        this.createdAt = new Date();
    }

    static getCollection() {
        return getDB().collection(this.collectionName);
    }

}

module.exports = User;