// C:/Projects/veridium-server/controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmployeeAffiliation = require('../models/EmployeeAffiliation'); // NEW IMPORT

// HR Manager registers a new company (Existing function)
const registerHrManager = async (req, res) => {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password || !companyName) {
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    try {
        const existingUser = await User.getCollection().findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User(
            name,
            email,
            hashedPassword,
            'hr',
            companyName
        );
        
        const result = await User.getCollection().insertOne(newUser);

        res.status(201).json({
            message: 'HR Manager registered successfully.',
            userId: result.insertedId,
            user: { name: newUser.name, email: newUser.email, role: newUser.role }
        });

    } catch (error) {
        console.error('Error during HR registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


// Login function for both HR and Employee (Existing function)
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try {
        const user = await User.getCollection().findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Check if employee is pending approval (HR users are always approved)
        if (user.role === 'employee' && user.status !== 'approved') {
            return res.status(403).json({ message: 'Account is pending HR approval.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName,
            }
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};


// Search for an HR Manager by email or name (NEW function from previous step)
const searchHrManager = async (req, res) => {
    const { searchTerm } = req.query;

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required.' });
    }

    try {
        const query = {
            role: 'hr',
            $or: [
                { email: { $regex: searchTerm, $options: 'i' } },
                { companyName: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        const hrManagers = await User.getCollection()
            .find(query)
            .project({ _id: 1, name: 1, email: 1, companyName: 1 })
            .toArray();
        
        if (hrManagers.length === 0) {
            return res.status(404).json({ message: 'No companies or HR managers found.' });
        }

        res.status(200).json(hrManagers);

    } catch (error) {
        console.error('Error during HR search:', error);
        res.status(500).json({ message: 'Server error during search.' });
    }
};


// Employee registers and sends affiliation request (FINAL AUTH function)
const registerEmployee = async (req, res) => {
    const { name, email, password, hrManagerId, companyName } = req.body;

    // 1. Basic validation
    if (!name || !email || !password || !hrManagerId || !companyName) {
        return res.status(400).json({ message: 'Please enter all required fields and select a company.' });
    }

    try {
        // 2. Check if employee email already exists
        const existingUser = await User.getCollection().findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // 3. Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Create a new Employee User (status 'pending')
        const newUser = new User(
            name,
            email,
            hashedPassword,
            'employee', // Fixed role
            companyName // Associated company name
        );
        newUser.status = 'pending'; // MUST be pending approval

        const userResult = await User.getCollection().insertOne(newUser);
        const employeeId = userResult.insertedId;

        // 5. Create the Affiliation Request
        const newAffiliation = new EmployeeAffiliation(
            employeeId,
            hrManagerId,
            companyName,
            'Pending' // Initial status
        );

        await EmployeeAffiliation.getCollection().insertOne(newAffiliation);

        // 6. Respond successfully
        res.status(201).json({
            message: 'Registration successful. Your account is pending HR approval.',
            userId: employeeId,
            status: 'pending'
        });

    } catch (error) {
        console.error('Error during Employee registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


module.exports = {
    registerHrManager,
    loginUser,
    searchHrManager,
    registerEmployee, // <-- FINAL AUTH EXPORT
};