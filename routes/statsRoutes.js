const express = require('express');
const router = express.Router();
const { getHRStats } = require('../controllers/statsController');
const { verifyToken, verifyHR } = require('../middleware/authMiddleware');

// Get all dashboard analytics for HR
router.get('/hr-stats', verifyToken, verifyHR, getHRStats);

module.exports = router;