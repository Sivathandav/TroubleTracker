import { useState, useEffect, useRef } from 'react';
import Sidebar from '../common/Sidebar';
import ColorSwatch from './ColorSwatch';
import FixedToast from './FixedToast';
import { useAuth } from '../../context/AuthContext';
import { useChatbotSettings } from '../../store/chatbotSettings';
import styles from './ChatBot.module.css';
import chatWidgetStyles from '../FloatingChatWidget/FloatingChatWidget.module.css';

const ChatBot = () => {
  const { token } = useAuth();
  const { settings, updateSetting, updateColor, updateFormField, updateTimer } = useChatbotSettings();
  const [activeMenu, setActiveMenu] = useState('chatbot');
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [messages, setMessages] = useState([]);
  const [isEditingWelcome, setIsEditingWelcome] = useState(false);
  const [missedChatAlert, setMissedChatAlert] = useState(false);
  const missedChatTimerRef = useRef(null);
  const ticketIdRef = useRef(null);

  const handleColorChange = (colorKey, value) => {
    updateColor(colorKey, value);
  };

  const handleMessageChange = (key, value) => {
    updateSetting(key, value);
  };

  const handleFormFieldChange = (fieldId, label, placeholder) => {
    updateFormField(fieldId, { label, placeholder });
  };

  const handleTimerChange = (timerKey, value) => {
    updateTimer(timerKey, parseInt(value) || 0);
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/customization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error saving settings: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  // Calculate missed chat timer in milliseconds
  const getMissedChatTimerMs = () => {
    const { hours = 0, minutes = 5, seconds = 0 } = settings.missedChatTimer || {};
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  };

  // Start missed chat timer when user sends a message
  const startMissedChatTimer = () => {
    // Clear existing timer
    if (missedChatTimerRef.current) {
      clearTimeout(missedChatTimerRef.current);
    }

    const timerMs = getMissedChatTimerMs();
    
    missedChatTimerRef.current = setTimeout(async () => {
      // Mark chat as missed
      setMissedChatAlert(true);
      
      // Try to mark in database if ticketId exists
      if (ticketIdRef.current) {
        try {
          await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/tickets/${ticketIdRef.current}/mark-missed`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error marking missed chat:', error);
        }
      }
    }, timerMs);
  };

  // Reset timer when bot responds or chat is closed
  const resetMissedChatTimer = () => {
    if (missedChatTimerRef.current) {
      clearTimeout(missedChatTimerRef.current);
      missedChatTimerRef.current = null;
    }
    setMissedChatAlert(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (missedChatTimerRef.current) {
        clearTimeout(missedChatTimerRef.current);
      }
    };
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      setStep('chat');
      setMessages([
        {
          sender: 'Support',
          senderType: 'team',
          body: settings.welcomeMessage,
          timestamp: new Date(),
        },
      ]);
      // Start missed chat timer when user enters chat
      startMissedChatTimer();
    }
  };

  const handleCloseToast = (e) => {
    e.preventDefault();
    // Toast close is disabled on ChatBot page
  };

  return (
    <div className={styles.container}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Chat Bot</h1>
        </header>

        <div className={styles.contentWrapper}>
          {/* Left Section - Preview */}
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
            </div>
            <div className={styles.previewArea}>
              {/* Preview Wrapper - Vertical Stack */}
              <div className={styles.previewWrapper}>
                {/* Chat Widget */}
                <div className={styles.chatWidgetContainer}>
                  <div
                    className={chatWidgetStyles.chatWidget}
                    style={{
                      position: 'relative',
                      bottom: 'auto',
                      right: 'auto',
                      width: '360px',
                    }}
                  >
                  {/* Header */}
                  <div
                    className={chatWidgetStyles.chatHeader}
                    style={{ backgroundColor: settings.headerColor }}
                  >
                    <div className={chatWidgetStyles.headerContent}>
                      <img
                        src={require('../../assets/images/Landing Page/Ellipse 6.png')}
                        alt="Avatar"
                        className={chatWidgetStyles.headerAvatar}
                      />
                      <span className={chatWidgetStyles.headerTitle}>{settings.botName}</span>
                      <div className={chatWidgetStyles.onlineIndicator}></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div 
                    className={chatWidgetStyles.chatContent}
                    style={{ backgroundColor: settings.backgroundColor }}
                  >
                    {step === 'form' ? (
                      <>
                        <div className={chatWidgetStyles.welcomeBubble}>
                          <span className={chatWidgetStyles.welcomeMessage}>
                            {settings.greetingMessage}
                          </span>
                        </div>

                        <div className={chatWidgetStyles.formWrapper}>
                          <img
                            src={require('../../assets/images/Landing Page/Ellipse 6.png')}
                            alt="Avatar"
                            className={chatWidgetStyles.formAvatar}
                          />
                          <form
                            onSubmit={handleFormSubmit}
                            className={chatWidgetStyles.contactForm}
                          >
                            <p className={chatWidgetStyles.welcomeText}>
                              Introduction Yourself
                            </p>
                            {settings.introFormFields.map((field) => (
                              <div key={field.id} className={chatWidgetStyles.formGroup}>
                                <label className={chatWidgetStyles.label}>{field.label}</label>
                                <input
                                  type={field.label.toLowerCase().includes('email') ? 'email' : 'text'}
                                  name={field.label.toLowerCase().includes('email') ? 'email' : field.label.toLowerCase().includes('phone') ? 'phone' : 'name'}
                                  value={
                                    field.label.toLowerCase().includes('email')
                                      ? formData.email
                                      : field.label.toLowerCase().includes('phone')
                                      ? formData.phone
                                      : formData.name
                                  }
                                  onChange={handleFormChange}
                                  className={chatWidgetStyles.input}
                                  placeholder={field.placeholder}
                                  required={field.required}
                                />
                              </div>
                            ))}
                            <button
                              type="submit"
                              className={chatWidgetStyles.submitButton}
                            >
                              Thank You!
                            </button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <>
                        {missedChatAlert && (
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#FEE2E2',
                            border: '1px solid #FECACA',
                            borderRadius: '8px',
                            margin: '12px',
                            color: '#DC2626',
                            fontSize: '13px',
                            fontWeight: '500',
                          }}>
                            ⚠️ This chat has been marked as missed. No response received within the configured time limit.
                          </div>
                        )}
                        <div className={chatWidgetStyles.messagesContainer}>
                          {messages.map((msg, index) => (
                            <div
                              key={index}
                              className={`${chatWidgetStyles.message} ${
                                msg.senderType === 'user'
                                  ? chatWidgetStyles.userMessage
                                  : chatWidgetStyles.teamMessage
                              }`}
                            >
                              {msg.senderType === 'team' && (
                                <div className={chatWidgetStyles.messageAvatar}></div>
                              )}
                              <div className={chatWidgetStyles.messageBubble}>
                                <p className={chatWidgetStyles.messageText}>{msg.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Message Form */}
                  <form className={chatWidgetStyles.messageForm}>
                    <input
                      type="text"
                      className={chatWidgetStyles.messageInput}
                      placeholder="Write a message"
                      disabled
                    />
                    <button
                      type="button"
                      className={chatWidgetStyles.sendButton}
                      disabled
                    ></button>
                  </form>
                </div>
              </div>

                {/* Toast Preview - Below Chat Widget */}
                {step === 'form' && (
                  <FixedToast
                    message={settings.welcomeMessage}
                    onClose={handleCloseToast}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Settings Panel */}
          <div className={styles.settingsPanel}>
            {/* Header Color Card */}
            <div className={styles.settingCard}>
              <label className={styles.settingLabel}>Header Color</label>
              <ColorSwatch
                value={settings.headerColor}
                onChange={(value) => handleColorChange('headerColor', value)}
              />
            </div>

            {/* Custom Background Color Card */}
            <div className={styles.settingCard}>
              <label className={styles.settingLabel}>Custom Background Color</label>
              <ColorSwatch
                value={settings.backgroundColor}
                onChange={(value) => handleColorChange('backgroundColor', value)}
              />
            </div>

            {/* Customize Messages Card */}
            <div className={styles.settingCard}>
              <label className={styles.settingLabel}>Customize Messages</label>
              <div className={styles.textAreaWrapper}>
                <textarea
                  value={settings.greetingMessage}
                  onChange={(e) => handleMessageChange('greetingMessage', e.target.value)}
                  className={`${styles.textArea} ${styles.noResize} ${styles.customWideInput}`}
                  placeholder="Greeting message"
                />
                <button
                  className={styles.editButtonInside}
                  onClick={() => {}}
                  title="Edit message"
                >
                  <img
                    src={require('../../assets/images/ChatBot/ic_round-edit.png')}
                    alt="Edit"
                    className={styles.editIconInside}
                  />
                </button>
              </div>
            </div>

            {/* Introduction Form Card */}
            <div className={styles.settingCard}>
              <label className={styles.settingLabel}>Introduction Form</label>
              <div className={styles.formFieldsContainer}>
                {settings.introFormFields.map((field) => (
                  <div key={field.id} className={styles.formFieldRow}>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        handleFormFieldChange(field.id, e.target.value, field.placeholder)
                      }
                      className={styles.fieldInput}
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) =>
                        handleFormFieldChange(field.id, field.label, e.target.value)
                      }
                      className={styles.fieldInput}
                      placeholder="Placeholder"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Welcome Message Card */}
            <div className={styles.settingCard}>
              <label className={styles.settingLabel}>Welcome Message</label>
              <div className={styles.textAreaWrapper}>
                <textarea
                  value={settings.welcomeMessage}
                  onChange={(e) => handleMessageChange('welcomeMessage', e.target.value)}
                  disabled={!isEditingWelcome}
                  className={`${styles.textArea} ${styles.noResize} ${styles.customWideInput} ${!isEditingWelcome ? styles.disabled : ''}`}
                  placeholder="Welcome message"
                />
                <button
                  className={styles.editButtonInside}
                  onClick={() => setIsEditingWelcome(!isEditingWelcome)}
                  title={isEditingWelcome ? 'Done editing' : 'Edit message'}
                >
                  <img
                    src={require('../../assets/images/ChatBot/ic_round-edit.png')}
                    alt={isEditingWelcome ? 'Done' : 'Edit'}
                    className={styles.editIconInside}
                  />
                </button>
              </div>
            </div>

            {/* Missed Chat Timer Card */}
            <div className={styles.timerCard}>
              {/* Timer Content - Left Side */}
              <div className={styles.timerContent}>
                <label className={styles.timerTitle}>Missed chat timer</label>
                
                {/* Display above - previous values */}
                <div className={styles.timerDisplayRow}>
                  <span className={styles.timerDisplayValue}>
                    {String((settings.missedChatTimer.hours - 1 + 24) % 24).padStart(2, '0')}
                  </span>
                  <span className={styles.timerDisplayValue}>
                    {String((settings.missedChatTimer.minutes - 1 + 60) % 60).padStart(2, '0')}
                  </span>
                  <span className={styles.timerDisplayValue}>
                    {String((settings.missedChatTimer.seconds - 1 + 60) % 60).padStart(2, '0')}
                  </span>
                </div>

                {/* Input row - editable */}
                <div className={styles.timerInputRow}>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={String(settings.missedChatTimer.hours).padStart(2, '0')}
                    onChange={(e) => {
                      const val = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                      handleTimerChange('hours', String(val));
                    }}
                    className={styles.timerInputField}
                  />
                  <span className={styles.timerSeparatorText}>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={String(settings.missedChatTimer.minutes).padStart(2, '0')}
                    onChange={(e) => {
                      const val = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                      handleTimerChange('minutes', String(val));
                    }}
                    className={styles.timerInputField}
                  />
                  <span className={styles.timerSeparatorText}>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={String(settings.missedChatTimer.seconds).padStart(2, '0')}
                    onChange={(e) => {
                      const val = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                      handleTimerChange('seconds', String(val));
                    }}
                    className={styles.timerInputField}
                  />
                </div>

                {/* Display below - next values */}
                <div className={styles.timerDisplayRow}>
                  <span className={styles.timerDisplayValue}>
                    {String((settings.missedChatTimer.hours + 1) % 24).padStart(2, '0')}
                  </span>
                  <span className={styles.timerDisplayValue}>
                    {String((settings.missedChatTimer.minutes + 1) % 60).padStart(2, '0')}
                  </span>
                  <span className={styles.timerDisplayValue}>
                    {String((settings.missedChatTimer.seconds + 1) % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Save Button - Right Side */}
              <button className={styles.timerSaveButton} onClick={handleSaveSettings}>
                Save
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatBot;
