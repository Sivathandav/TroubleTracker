const Customization = require('../models/Customization');

// @desc    Get chat widget customization settings
// @route   GET /api/customization
// @access  Public
const getCustomization = async (req, res) => {
  try {
    console.log('Fetching customization settings...');
    const settings = await Customization.getSettings();
    console.log('Settings retrieved:', settings);

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Get customization error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error fetching customization',
      error: error.message,
    });
  }
};

// @desc    Update customization settings
// @route   PUT /api/customization
// @access  Protected (Admin only)
const updateCustomization = async (req, res) => {
  try {
    const { colors, welcomeMessage, greetingMessage, missedChatThreshold } =
      req.body;

    let settings = await Customization.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = await Customization.create({
        colors,
        welcomeMessage,
        greetingMessage,
        missedChatThreshold,
      });
    } else {
      // Update existing settings
      if (colors) {
        if (colors.header) settings.colors.header = colors.header;
        if (colors.background) settings.colors.background = colors.background;
        if (colors.input) settings.colors.input = colors.input;
      }

      if (welcomeMessage !== undefined)
        settings.welcomeMessage = welcomeMessage;
      if (greetingMessage !== undefined)
        settings.greetingMessage = greetingMessage;
      if (missedChatThreshold !== undefined)
        settings.missedChatThreshold = missedChatThreshold;

      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Customization updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Update customization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating customization',
    });
  }
};

module.exports = {
  getCustomization,
  updateCustomization,
};
