const express = require('express');
const { verifyToken, verifyHR } = require('../middleware/authMiddleware');
const { createAsset, getAssets, updateAsset, deleteAsset } = require('../controllers/assetController');
const router = express.Router();

// READ: Protected by verifyToken (accessible by both HR and Employee)
router.get('/', verifyToken, getAssets);

// CREATE, UPDATE, DELETE: Protected by verifyHR (only accessible by HR Managers)
router.post('/', verifyToken, verifyHR, createAsset);
router.patch('/:id', verifyToken, verifyHR, updateAsset);
router.delete('/:id', verifyToken, verifyHR, deleteAsset);

module.exports = router;