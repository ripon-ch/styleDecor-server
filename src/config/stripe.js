const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not found in environment variables');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;