const express = require('express');
const { hrRegister, employeeRegister, login } = require('../controllers/authController');
const router = express.Router();

router.post('/hr-register', hrRegister);       
router.post('/employee-register', employeeRegister); 
router.post('/login', login);                 

module.exports = router;