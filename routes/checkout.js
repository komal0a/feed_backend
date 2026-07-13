// routes/checkout.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-intent', protectRoute, async (req, res) => {
  try {
    const { amount, restaurant, dishName } = req.body;

    // Stripe expects the amount in the smallest currency unit (e.g., paise for INR, cents for USD)
    // If the price is ₹299, Stripe needs 29900
    const amountInSmallestUnit = parseInt(amount.replace(/[^0-9]/g, '')) * 100;

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: 'inr', // Change to 'usd' if you are outside India
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        restaurant,
        dishName,
        userId: req.user._id.toString()
      }
    });

    // Send the secret token back to React
    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

module.exports = router;