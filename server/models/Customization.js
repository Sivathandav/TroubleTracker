const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  headerColor: {
    type: String,
    default: '#33475B',
  },
  backgroundColor: {
    type: String,
    default: '#F3F4F6',
  },
  inputColor: {
    type: String,
    default: '#FFFFFF',
  },
  botName: {
    type: String,
    default: 'Chat Support',
  },
  message1: {
    type: String,
    default: 'How can I help you?',
    maxlength: 50,
  },
  message2: {
    type: String,
    default: 'Ask me anything!',
    maxlength: 50,
  },
  welcomeToast: {
    type: String,
    default: 'Want to chat about Hubly? I\'m an chatbot here to help you find your way.',
    maxlength: 150,
  },
  introForm: {
    enabled: { type: Boolean, default: true },
    fields: [
      {
        key: String,
        label: String,
        placeholder: String,
        required: { type: Boolean, default: false },
      },
    ],
  },
  missedChatTimer: {
    hours: {
      type: Number,
      default: 0,
      min: 0,
      max: 23,
    },
    minutes: {
      type: Number,
      default: 5,
      min: 0,
      max: 59,
    },
    seconds: {
      type: Number,
      default: 0,
      min: 0,
      max: 59,
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
customizationSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// Static method to get or create settings
customizationSchema.statics.getSettings = async function () {
  try {
    let settings = await this.findOne();
    if (!settings) {
      settings = await this.create({});
    }
    return settings;
  } catch (error) {
    console.error('Error getting customization settings:', error);
    // Return default settings if error occurs
    return {
      missedChatTimer: { hours: 0, minutes: 5, seconds: 0 },
    };
  }
};

// Instance method to get missed chat timer in seconds
customizationSchema.methods.getMissedChatTimerSeconds = function () {
  const { hours = 0, minutes = 5, seconds = 0 } = this.missedChatTimer || {};
  return hours * 3600 + minutes * 60 + seconds;
};

module.exports = mongoose.model('Customization', customizationSchema);
