import { useState, useEffect, useRef } from 'react';
import styles from './FloatingChatWidget.module.css';
import { useChatbotSettings } from '../../store/chatbotSettings';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const FloatingChatWidget = () => {
  const { settings } = useChatbotSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const [step, setStep] = useState('form'); // 'form' | 'chat'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [ticketId, setTicketId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasReceivedFirstResponse, setHasReceivedFirstResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Ensure component re-renders when settings change
  useEffect(() => {
    // This effect just ensures the component re-renders when settings change
    // The settings are used in the render, so this dependency ensures updates
  }, [settings]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (isOpen && step === 'chat' && ticketId) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isOpen, step, ticketId]);



  const startPolling = () => {
    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchMessages = async () => {
    if (!ticketId) return;

    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.ticket.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowToast(false);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setTicketId(data.ticket._id);
        setStep('chat');
        setHasReceivedFirstResponse(false);
        // Display welcome message when chat opens
        setMessages(data.ticket.messages || [
          {
            sender: 'Support',
            senderType: 'team',
            body: settings.welcomeMessage,
            timestamp: new Date(),
          },
        ]);
      } else {
        alert('Error creating ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!currentMessage.trim() || !ticketId) return;

    const userMessage = currentMessage;
    const newMessage = {
      sender: formData.name,
      senderType: 'user',
      body: userMessage,
      timestamp: new Date(),
    };

    // Optimistically add message to UI
    setMessages([...messages, newMessage]);
    setCurrentMessage('');

    try {
      const response = await fetch(
        `${API_URL}/tickets/${ticketId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        }
      );

      if (!response.ok) {
        // If failed, fetch latest messages
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      fetchMessages();
    }

    // Auto-response after 5 seconds - only send once
    if (!hasReceivedFirstResponse) {
      setTimeout(() => {
        const autoResponse = {
          sender: 'Support',
          senderType: 'team',
          body: 'Thank you for your message. We will get back to you soon with a resolution.',
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, autoResponse]);
        setHasReceivedFirstResponse(true);
      }, 5000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* Toast Preview - Shows above chat icon */}
      {!isOpen && showToast && (
        <div className={styles.toastPreview}>
          <div className={styles.toastHeader}>
            <img 
              src={require('../../assets/images/Landing Page/Ellipse 6.png')} 
              alt="Chatbot avatar" 
              className={styles.toastAvatar}
            />
            <button 
              className={styles.toastCloseBtn} 
              onClick={handleCloseToast}
              aria-label="Close preview"
            >
              <img 
                src={require('../../assets/images/Landing Page/cross 1.png')} 
                alt="Close" 
                className={styles.toastCloseIcon}
              />
            </button>
          </div>
          <div className={styles.toastContent}>
            <p className={styles.toastText}>
              {settings.toastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Floating Button - Changes to close icon when open */}
      <button className={styles.floatingButton} onClick={handleToggle}>
        {!isOpen ? (
          <div className={styles.chatIcon}></div>
        ) : (
          <div className={styles.closeIcon}>✕</div>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className={styles.chatWidget}>
          {/* Header with Avatar and Name */}
          <div 
            className={styles.chatHeader}
            style={{ backgroundColor: settings.headerColor }}
          >
            <div className={styles.headerContent}>
              <img 
                src={require('../../assets/images/Landing Page/Ellipse 6.png')} 
                alt="Hubly Avatar" 
                className={styles.headerAvatar}
              />
              <span className={styles.headerTitle}>Hubly</span>
              <div className={styles.onlineIndicator}></div>
            </div>
          </div>

          {/* Content */}
          <div 
            className={styles.chatContent}
            style={{ backgroundColor: settings.backgroundColor }}
          >
            {step === 'form' ? (
              <>
                {/* Form with Avatar */}
                <div className={styles.formWrapper}>
                  <img 
                    src={require('../../assets/images/Landing Page/Ellipse 6.png')} 
                    alt="Avatar" 
                    className={styles.formAvatar}
                  />
                  <form onSubmit={handleFormSubmit} className={styles.contactForm}>
                    <p className={styles.welcomeText}>
                      Introduction Yourself
                    </p>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Your name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={styles.input}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Your Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className={styles.input}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Your Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={styles.input}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Please wait...' : 'Thank You!'}
                    </button>
                  </form>
                </div>


              </>
            ) : (
              <>
                <div className={styles.messagesContainer}>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`${styles.message} ${
                        msg.senderType === 'user'
                          ? styles.userMessage
                          : styles.teamMessage
                      }`}
                    >
                      {msg.senderType === 'team' && (
                        <div className={styles.messageAvatar}></div>
                      )}
                      <div className={styles.messageBubble}>
                        <p className={styles.messageText}>{msg.body}</p>
                        <span className={styles.messageTime}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {msg.senderType === 'user' && (
                        <div className={styles.messageAvatar}></div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </>
            )}
          </div>

          {/* Message Composer - Always visible in footer */}
          <form onSubmit={step === 'chat' ? handleSendMessage : (e) => e.preventDefault()} className={styles.messageForm}>
            <input
              type="text"
              value={step === 'chat' ? currentMessage : ''}
              onChange={(e) => step === 'chat' && setCurrentMessage(e.target.value)}
              onKeyPress={step === 'chat' ? handleKeyPress : undefined}
              className={styles.messageInput}
              placeholder="Write a message"
            />
            <button type="submit" className={styles.sendButton} aria-label="Send message">
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;
