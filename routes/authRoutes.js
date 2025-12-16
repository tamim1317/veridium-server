const express = require('express');
const { registerHrManager, loginUser } = require('../controllers/authController'); // <-- Import loginUser

const router = express.Router();

// Route for HR Manager registration
router.post('/hr-register', registerHrManager);

// Route for User Login (HR and Employee)
router.post('/login', loginUser); // <-- New Login Route

module.exports = router;