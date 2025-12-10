// src/controllers/payment.controller.js
const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, couponCode } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let amount = Math.round((booking.totalAmount || 0) * 100); // in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { bookingId: booking._id.toString() }
    });

    const p = await Payment.create({
      transactionId: paymentIntent.id,
      booking: booking._id,
      customer: req.user._id,
      amount: amount / 100,
      currency: 'usd',
      paymentMethod: 'card',
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      createdAt: new Date()
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentId: p._id });
  } catch (err) {
    console.error('createPaymentIntent', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'succeeded' },
        { new: true }
      );

      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid', status: 'confirmed' });
      res.json({ success: true, payment });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (err) {
    console.error('confirmPayment', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// webhook handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const bookingId = intent.metadata.bookingId;
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid', status: 'confirmed' });
      await Payment.findOneAndUpdate({ stripePaymentIntentId: intent.id }, { status: 'succeeded' });
    }
    res.json({ received: true });
  } catch (err) {
    console.error('stripe webhook error', err);
    res.status(400).send(`Webhook error: ${err.message}`);
  }
};
