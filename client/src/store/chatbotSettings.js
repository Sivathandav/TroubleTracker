import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatbotSettings = create(
  persist(
    (set) => ({
  settings: {
    headerColor: '#33475B',
    backgroundColor: '#FFFFFF',
    inputFieldColor: '#F3F4F6',
    welcomeMessage: '👋 Want to chat about Hubly? I\'m a chatbot here to help you find your way.',
    greetingMessage: 'Welcome to Hubly Support',
    botName: 'Chat Support',
    toastMessage: '👋 Want to chat about Hubly? I\'m a chatbot here to help you find your way.',
    avatar: null,
    introFormFields: [
      { id: 1, label: 'Name', placeholder: 'Your name', required: true },
      { id: 2, label: 'Email', placeholder: 'your@email.com', required: true },
      { id: 3, label: 'Phone', placeholder: '+1 (555) 000-0000', required: false },
    ],
    missedChatTimer: { hours: 0, minutes: 5, seconds: 0 },
  },

  updateSetting: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    })),

  updateColor: (colorKey, value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [colorKey]: value,
      },
    })),

  updateFormField: (fieldId, updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        introFormFields: state.settings.introFormFields.map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field
        ),
      },
    })),

  updateTimer: (timerKey, value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        missedChatTimer: {
          ...state.settings.missedChatTimer,
          [timerKey]: value,
        },
      },
    })),

  resetSettings: (originalSettings) =>
    set(() => ({
      settings: originalSettings,
    })),
    }),
    {
      name: 'chatbot-settings-storage',
    }
  )
);
