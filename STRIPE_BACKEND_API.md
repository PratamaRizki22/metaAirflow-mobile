# Stripe Payment Sheet API - Backend Implementation

## Required Endpoint

### POST /api/payments/payment-sheet

Create Payment Intent and return parameters for Stripe Payment Sheet.

---

## Implementation (Node.js/Express)

### 1. Install Stripe SDK

```bash
npm install stripe
```

### 2. Environment Variables

Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

### 3. Create Payment Route

**File: `routes/payment.routes.js`**

```javascript
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Booking = require('../models/Booking');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payments/payment-sheet
 * Create Payment Intent for booking
 */
router.post('/payment-sheet', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id; // From auth middleware

    // 1. Validate booking exists and belongs to user
    const booking = await Booking.findById(bookingId)
      .populate('property')
      .populate('tenant');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.tenant._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking already paid' 
      });
    }

    // 2. Get or create Stripe customer
    let customer;ya lanjut
    if (booking.tenant.stripeCustomerId) {
      customer = await stripe.customers.retrieve(booking.tenant.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: booking.tenant.email,
        name: `${booking.tenant.firstName} ${booking.tenant.lastName}`,
        metadata: {
          userId: userId,
          bookingId: bookingId
        }
      });

      // Save customer ID to user
      await User.findByIdAndUpdate(userId, {
        stripeCustomerId: customer.id
      });
    }

    // 3. Create ephemeral key for customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-11-20.acacia' }
    );

    // 4. Calculate amount from booking
    const amount = Math.round(booking.totalPrice * 100); // Convert to cents

    // 5. Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'myr',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking._id.toString(),
        propertyId: booking.property._id.toString(),
        userId: userId
      },
      description: `Booking for ${booking.property.title}`
    });

    // 6. Save payment intent ID to booking
    booking.stripePaymentIntentId = paymentIntent.id;
    await booking.save();

    // 7. Return response
    res.json({
      success: true,
      data: {
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      }
    });

  } catch (error) {
    console.error('Payment sheet error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
});

module.exports = router;
```

### 4. Register Route

**File: `server.js` or `app.js`**

```javascript
const paymentRoutes = require('./routes/payment.routes');

// Register route
app.use('/api/payments', paymentRoutes);
```

---

## Webhook Handler (Optional but Recommended)

Handle payment events from Stripe:

**File: `routes/payment.routes.js`**

```javascript
/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks
 */
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update booking status
        await Booking.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { 
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            paidAt: new Date()
          }
        );
        
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        await Booking.findOneAndUpdate(
          { stripePaymentIntentId: failedPayment.id },
          { paymentStatus: 'FAILED' }
        );
        
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);
```

---

## Database Schema Updates

Add Stripe fields to your models:

**User Model:**
```javascript
stripeCustomerId: {
  type: String,
  default: null
}
```

**Booking Model:**
```javascript
stripePaymentIntentId: {
  type: String,
  default: null
},
paymentStatus: {
  type: String,
  enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
  default: 'PENDING'
},
paidAt: {
  type: Date,
  default: null
}
```

---

## Testing

### Test with Stripe Test Cards:

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Test the endpoint:

```bash
curl -X POST http://localhost:3000/api/payments/payment-sheet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"bookingId": "booking_id_here"}'
```

---

## Security Checklist

- ✅ Validate booking belongs to authenticated user
- ✅ Check booking not already paid
- ✅ Amount calculated from database (not from request)
- ✅ Use environment variables for keys
- ✅ Implement webhook signature verification
- ✅ Log all payment events
- ✅ Handle errors gracefully

---

## Summary

**Required:**
1. ✅ Install `stripe` package
2. ✅ Add environment variables
3. ✅ Create `/api/payments/payment-sheet` endpoint
4. ✅ Update database schemas

**Recommended:**
5. ✅ Implement webhook handler
6. ✅ Add proper error handling
7. ✅ Add logging

**Frontend is ready!** Just implement this backend endpoint and you're done! 🚀
