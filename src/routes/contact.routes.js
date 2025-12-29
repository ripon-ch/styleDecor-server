const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// Define the handler function separately to ensure it is not undefined
const handlePostContact = async (req, res) => {
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
      message: 'Your message has been sent successfully.',
      ticketId: contactMessage._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleGetTickets = async (req, res) => {
  try {
    const tickets = await ContactMessage.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Line 7: Using the named function ensures it's defined
router.post('/', optionalAuth, handlePostContact);
router.get('/my-tickets', protect, handleGetTickets);

module.exports = router;