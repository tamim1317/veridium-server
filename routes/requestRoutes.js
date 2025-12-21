const express = require('express');
const router = express.Router();
const { createRequest, approveRequest } = require('../controllers/requestController');
const { verifyToken, verifyHR } = require('../middleware/authMiddleware');

// Employee makes a request
router.post('/request-asset', verifyToken, createRequest);

// HR approves a request
router.patch('/approve/:id', verifyToken, verifyHR, approveRequest);

module.exports = router;