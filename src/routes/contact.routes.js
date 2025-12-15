const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { authenticateJWT, optionalAuth } = require('../middleware/auth.middleware');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public/Private
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
      userId: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      ticketId: contactMessage._id
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's support tickets
// @route   GET /api/contact/my-tickets
// @access  Private
router.get('/my-tickets', authenticateJWT, async (req, res, next) => {
  try {
    const tickets = await ContactMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;