const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { connectDB } = require('../config/db');

//Create Payment Intent
const createPaymentIntent = async (req, res) => {
    try {
        const { price } = req.body;
        
        // Convert price to cents
        const amount = parseInt(price * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card']
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ message: "Stripe connection failed" });
    }
};

//Handle Post-Payment Logic (Save Payment & Update Limit)
const handlePaymentSuccess = async (req, res) => {
    try {
        const db = await connectDB();
        const { transactionId, packageLimit, price, packageName } = req.body;
        const hrEmail = req.user.email;

        //Record the payment in the payments collection
        const paymentInfo = {
            transactionId,
            hrEmail,
            price,
            packageName,
            date: new Date(),
            status: "completed"
        };
        await db.collection('payments').insertOne(paymentInfo);

        //Update HR's subscription status and package limit
        const updateResult = await db.collection('users').updateOne(
            { email: hrEmail },
            { 
                $set: { 
                    packageLimit: parseInt(packageLimit),
                    subscription: packageName.toLowerCase()
                } 
            }
        );

        res.json({ success: true, message: "Package upgraded successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update package limit" });
    }
};

module.exports = { createPaymentIntent, handlePaymentSuccess };