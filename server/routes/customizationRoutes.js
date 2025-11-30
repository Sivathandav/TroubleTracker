const express = require('express');
const router = express.Router();
const Customization = require('../models/Customization');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Get customization settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    let settings = await Customization.findOne();

    if (!settings) {
      settings = new Customization({
        headerColor: '#33475B',
        backgroundColor: '#F3F4F6',
        inputColor: '#FFFFFF',
        botName: 'Chat Support',
        message1: 'How can I help you?',
        message2: 'Ask me anything!',
        welcomeToast: 'Want to chat about Hubly? I\'m an chatbot here to help you find your way.',
        introForm: {
          enabled: true,
          fields: [
            { key: 'name', label: 'Your name', placeholder: 'Your name', required: true },
            { key: 'phone', label: 'Your Phone', placeholder: '+1 (000) 000-0000', required: false },
            { key: 'email', label: 'Your Email', placeholder: 'example@gmail.com', required: false },
          ],
        },
        missedChatTimer: { hours: 0, minutes: 5, seconds: 0 },
      });
      await settings.save();
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Save/Update customization settings (POST and PUT both supported)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    let settings = await Customization.findOne();

    if (!settings) {
      settings = new Customization(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully',
      settings,
    });
  } catch (error) {
    console.error('Error saving customization:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update customization settings
router.put('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    let settings = await Customization.findOne();

    if (!settings) {
      settings = new Customization(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
