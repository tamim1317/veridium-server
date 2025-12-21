const express = require('express');
const router = express.Router();
const { createPaymentIntent, handlePaymentSuccess } = require('../controllers/paymentController');
const { verifyToken, verifyHR } = require('../middleware/authMiddleware');

//Create the intent when user opens the checkout modal
router.post('/create-payment-intent', verifyToken, verifyHR, createPaymentIntent);

//Save info and upgrade limit after Stripe confirms success
router.post('/payment-success', verifyToken, verifyHR, handlePaymentSuccess);

module.exports = router;