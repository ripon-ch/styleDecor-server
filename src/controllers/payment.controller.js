const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const stripe = require('../config/stripe');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { 
        bookingId: bookingId.toString(),
        customerId: req.user._id.toString()
      }
    });

    // Create payment record
    const payment = await Payment.create({
      transactionId: paymentIntent.id,
      bookingId,
      customerId: req.user._id,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      {
        status: 'paid',
        paidAt: new Date()
      },
      { new: true }
    ).populate('bookingId');

    // Update booking payment status
    await Booking.findByIdAndUpdate(payment.bookingId._id, {
      paymentStatus: 'paid',
      status: 'confirmed'
    });

    // Create notification
    await Notification.create({
      userId: payment.customerId,
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment of $${payment.amount} has been processed successfully`,
      relatedId: payment._id,
      relatedModel: 'Payment'
    });

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' 
      ? {} 
      : { customerId: req.user._id };

    const payments = await Payment.find(query)
      .populate({
        path: 'bookingId',
        select: 'bookingId eventDate location status',
        populate: {
          path: 'serviceId',
          select: 'serviceName'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments,
      count: payments.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: 'succeeded', paidAt: new Date() }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: failedPayment.id },
          { status: 'failed' }
        );
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};