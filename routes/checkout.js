const express = require('express');
const router = express.Router();
// Initialize Stripe with your secret key from the .env file
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/', async (req, res) => {
  try {
    const { reelId, price } = req.body;

    // Convert the price string (e.g. "₹299" or "$10") to a clean integer format for Stripe.
    // NOTE: Stripe expects amounts in the smallest currency unit (e.g., cents for USD, paise for INR).
    // For this MVP, we will strip non-numeric characters and multiply by 100.
    const numericPrice = parseInt(price.replace(/[^0-9]/g, ''), 10);
    
    if (isNaN(numericPrice)) {
      return res.status(400).json({ error: 'Invalid price format' });
    }

    const amountToCharge = numericPrice * 100;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountToCharge,
      currency: 'inr', // Change this to 'usd' if you are charging in US Dollars
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        reelId: reelId
      }
    });

    // Send the client secret back to the React frontend
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
// ```eof

// ### You are now officially 100% complete with Stripe! 🎉

// Here is the exact flow of what you just built:
// 1. User taps **"Proceed to Payment"** on the frontend.
// 2. React sends the dish price to this `routes/checkout.js` file.
// 3. Express securely contacts Stripe using your hidden `STRIPE_SECRET_KEY`.
// 4. Stripe says "Okay, here is a `clientSecret` permission slip for this specific transaction."
// 5. Express sends that `clientSecret` back to React.
// 6. React passes it to the `<PaymentForm/>`, which instantly renders the credit card input field. 

// You are fully cleared for takeoff. Follow the **Deployment Guide** to get this live! Let me know when you get your live URLs.