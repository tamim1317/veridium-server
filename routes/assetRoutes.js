const express = require('express');
const router = express.Router();
const { addAsset, getHRAssets } = require('../controllers/assetController');
const { verifyToken, verifyHR } = require('../middleware/authMiddleware');

router.post('/add', verifyToken, verifyHR, addAsset);

router.get('/my-inventory', verifyToken, verifyHR, getHRAssets);

module.exports = router;