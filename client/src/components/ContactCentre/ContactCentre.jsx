import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ContactCentre.module.css';
import Sidebar from '../common/Sidebar';
import homeIcon from '../../assets/images/Dashboard/material-symbols-light_home-outline-rounded.png';
import contactIcon from '../../assets/images/Contact centre/mdi_contact-outline-2.png';
import phoneIcon from '../../assets/images/Contact centre/mdi-light_phone.png';
import emailIcon from '../../assets/images/Contact centre/lets-icons_message-light.png';
import ticketIcon from '../../assets/images/Contact centre/mdi_ticket-confirmation-outline-2.png';
import vectorIcon from '../../assets/images/Contact centre/Vector.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ContactCentre = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeMenu, setActiveMenu] = useState('chat');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const assignModalTriggerRef = useRef(null);
  const resolveModalTriggerRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`${API_URL}/users/team`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch team members');

      const data = await response.json();
      setTeamMembers(data.teamMembers || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTickets();
    fetchTeamMembers();

    const ticketId = searchParams.get('ticket');
    if (ticketId) {
      const ticket = tickets.find((t) => t.ticketId === ticketId);
      if (ticket) setSelectedTicket(ticket._id);
    }
  }, [token, searchParams]);

  // Polling for messages
  useEffect(() => {
    if (!selectedTicket) return;

    const pollMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/tickets/${selectedTicket}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        setTickets((prev) =>
          prev.map((t) => (t._id === selectedTicket ? data.ticket : t))
        );
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    pollingIntervalRef.current = setInterval(pollMessages, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedTicket, token]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket, tickets]);

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!message.trim() || !selectedTicket) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/tickets/${selectedTicket}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      setTickets((prev) =>
        prev.map((t) => (t._id === selectedTicket ? data.ticket : t))
      );
      setMessage('');
      setSuccessMessage('Message sent successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ticket assignment
  const handleAssignTicket = async () => {
    if (!selectedAssignee || !selectedTicket) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/tickets/${selectedTicket}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamMemberId: selectedAssignee }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign ticket');
      }

      const data = await response.json();
      setTickets((prev) =>
        prev.map((t) => (t._id === selectedTicket ? data.ticket : t))
      );
      setShowAssignModal(false);
      setSelectedAssignee('');
      setSelectedTicket(null);
      setSuccessMessage('Ticket assigned successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle marking as resolved
  const handleResolve = async () => {
    if (!selectedTicket) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/tickets/${selectedTicket}/resolve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resolve ticket');
      }

      const data = await response.json();
      setTickets((prev) =>
        prev.map((t) => (t._id === selectedTicket ? data.ticket : t))
      );
      setShowResolveModal(false);
      setSuccessMessage('Ticket resolved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tickets - backend already filters for team members, so just return all
  const filteredTickets = tickets;

  const selectedTicketData = tickets.find((t) => t._id === selectedTicket);

  // Check if user can chat
  // For admins: can chat if ticket is not assigned
  // For team members: can chat if ticket is assigned to them (backend already filters, so if they see it, they can chat)
  const canChat = selectedTicketData && (
    isAdmin ? !selectedTicketData.assignedTo : true
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <div className={styles.container}>
      {/* LEFT SIDEBAR */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />

      {/* MIDDLE PANEL - Chat List */}
      <aside className={styles.chatListPanel}>
        <div className={styles.chatListHeader}>
          <h2 className={styles.chatListTitle}>Contact Center</h2>
          <p className={styles.chatsLabel}>Chats</p>
        </div>

        <div className={styles.chatList}>
          {loading && <p className={styles.loadingText}>Loading...</p>}
          {error && <p className={styles.errorText}>{error}</p>}

          {!loading && filteredTickets.map((ticket, index) => {
            const userName = ticket.userContactInfo?.name || ticket.name || 'Unknown User';
            const lastMessage = ticket.messages && ticket.messages.length > 0
              ? ticket.messages[ticket.messages.length - 1]
              : null;
            const messagePreview = lastMessage
              ? (lastMessage.body || lastMessage.content || 'No message')
              : 'New ticket';

            return (
              <div
                key={ticket._id}
                className={`${styles.chatCard} ${
                  selectedTicket === ticket._id ? styles.activeChatCard : ''
                }`}
                onClick={() => setSelectedTicket(ticket._id)}
              >
                <div className={styles.chatAvatar}>
                  {getInitials(userName)}
                </div>
                <div className={styles.chatCardContent}>
                  <div className={styles.chatCardHeader}>
                    <span className={styles.chatId}>Chat {index + 1}</span>
                    <span className={styles.chatTime}>{formatTime(ticket.createdAt)}</span>
                  </div>
                  <p className={styles.chatPreview}>{messagePreview}</p>
                </div>
              </div>
            );
          })}

          {!loading && filteredTickets.length === 0 && (
            <p className={styles.emptyText}>No chats found</p>
          )}
        </div>
      </aside>

      {/* Success/Error Toast */}
      {successMessage && (
        <div className={styles.toast} style={{ backgroundColor: '#10B981' }}>
          {successMessage}
        </div>
      )}
      {error && (
        <div className={styles.toast} style={{ backgroundColor: '#EF4444' }}>
          {error}
        </div>
      )}

      {/* CENTER PANEL - Main Chat Area */}
      <main className={styles.mainChatPanel}>
        {selectedTicketData ? (
          <>
            <div className={styles.ticketHeader}>
              <span className={styles.ticketNumber}>
                Ticket# {selectedTicketData.ticketId}
              </span>
              <button className={styles.homeIconBtn} onClick={() => navigate('/dashboard')}>
                <img src={homeIcon} alt="Home" />
              </button>
            </div>

            <div className={styles.messagesArea}>
              <div className={styles.dateLabel}>
                {formatDate(selectedTicketData.createdAt)}
              </div>

              {selectedTicketData.messages && selectedTicketData.messages.length > 0 ? (
                selectedTicketData.messages.map((msg, index) => (
                  <div key={index} className={`${styles.messageRow} ${msg.senderType === 'team' ? styles.agentMessage : ''}`}>
                    <div className={styles.messageAvatar}>
                      {getInitials(msg.sender)}
                    </div>
                    <div className={styles.messageContent}>
                      <p className={styles.messageSender}>{msg.sender}</p>
                      <p className={styles.messageText}>{msg.body || msg.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.statusMessage}>
                  No messages yet
                </div>
              )}

              {selectedTicketData.status === 'resolved' && (
                <div className={styles.statusMessage}>
                  This chat has been resolved
                </div>
              )}

              {selectedTicketData.assignedTo && (
                <div className={styles.statusMessage}>
                  This chat is assigned to {selectedTicketData.assignedTo.name}
                </div>
              )}

              {/* Missed Chat Indicator */}
              {!selectedTicketData.firstReplyAt && selectedTicketData.status === 'unresolved' && (
                <div className={styles.missedChatIndicator}>
                  Replying to missed chat
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {canChat && selectedTicketData.status !== 'resolved' && (
              <form onSubmit={handleSendMessage} className={styles.messageInputArea}>
                <input
                  type="text"
                  placeholder="type here"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.messageInput}
                />
                <button type="submit" className={styles.sendIconBtn} disabled={isSubmitting || !message.trim()}>
                  <img src={vectorIcon} alt="Send" />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Select a chat to view conversation</p>
          </div>
        )}
      </main>

      {/* RIGHT PANEL - Details */}
      {selectedTicketData && (
        <aside className={styles.detailsPanel}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div className={styles.chatAvatar} style={{ width: '40px', height: '40px', fontSize: '16px', flexShrink: 0 }}>
              {getInitials(selectedTicketData.userContactInfo?.name || selectedTicketData.name)}
            </div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937', margin: '0' }}>
              {selectedTicketData.userContactInfo?.name || selectedTicketData.name}
            </p>
          </div>

          <div className={styles.detailsBox}>
            <h3 className={styles.detailsTitle}>
              Details
            </h3>

            <div className={styles.detailField}>
              <img src={contactIcon} alt="Name" className={styles.detailIcon} />
              <p className={styles.detailText}>{selectedTicketData.userContactInfo?.name || selectedTicketData.name}</p>
            </div>

            <div className={styles.detailField}>
              <img src={phoneIcon} alt="Phone" className={styles.detailIcon} />
              <p className={styles.detailText}>{selectedTicketData.userContactInfo?.phone || selectedTicketData.phone}</p>
            </div>

            <div className={styles.detailField}>
              <img src={emailIcon} alt="Email" className={styles.detailIcon} />
              <p className={styles.detailText}>{selectedTicketData.userContactInfo?.email || selectedTicketData.email}</p>
            </div>
          </div>

          {isAdmin && (
            <div className={styles.statusSection} style={{ position: 'relative' }}>
              <p className={styles.statusLabel}>Teammates</p>
              <div className={styles.profileSelectorContainer} style={{ position: 'relative' }}>
                {selectedTicketData.assignedTo ? (
                  <div className={styles.profileSelector}>
                    <div className={styles.profileAvatar}>
                      {getInitials(selectedTicketData.assignedTo.name)}
                    </div>
                    <p className={styles.profileName}>{selectedTicketData.assignedTo.name}</p>
                  </div>
                ) : selectedTicketData.status === 'resolved' ? (
                  <div className={styles.profileSelector} style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    <div className={styles.profileAvatar}>
                      {getInitials(user?.name || 'Admin')}
                    </div>
                    <p className={styles.profileName}>{user?.name || 'Admin'}</p>
                  </div>
                ) : (
                  <>
                    <button
                      ref={assignModalTriggerRef}
                      className={`${styles.profileSelector} ${showProfileDropdown ? styles.open : ''}`}
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      type="button"
                    >
                      <div className={styles.profileAvatar}>
                        {getInitials(user?.name || 'Admin')}
                      </div>
                      <p className={styles.profileName}>{user?.name || 'Admin'}</p>
                      <svg className={styles.profileDropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    {showProfileDropdown && (
                      <div className={styles.profileDropdown}>
                        {teamMembers
                          .filter((member) => member.role === 'team_member')
                          .map((member) => (
                            <button
                              key={member._id}
                              className={styles.profileDropdownItem}
                              onClick={() => {
                                setSelectedAssignee(member._id);
                                setShowProfileDropdown(false);
                                setShowAssignModal(true);
                              }}
                              type="button"
                            >
                              <div className={styles.profileAvatar}>
                                {getInitials(member.name)}
                              </div>
                              <p className={styles.profileDropdownItemName}>{member.name}</p>
                            </button>
                          ))}
                      </div>
                    )}
                    
                    {/* Assignment Modal */}
                    {showAssignModal && (
                      <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                          <h3 className={styles.modalTitle}>Chat would be assigned to Different team member</h3>
                          <p className={styles.modalText}>
                            Are you sure you want to assign this chat?
                          </p>
                          <div className={styles.modalActions}>
                            <button
                              className={styles.modalCancelBtn}
                              onClick={() => {
                                setShowAssignModal(false);
                                setSelectedAssignee('');
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className={styles.modalConfirmBtn}
                              onClick={handleAssignTicket}
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {canChat && (
            <div className={styles.statusSection} style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <button
                  ref={resolveModalTriggerRef}
                  className={`${styles.profileSelector} ${showStatusDropdown ? styles.open : ''}`}
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  type="button"
                  style={{ justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={ticketIcon} alt="Ticket" style={{ width: '20px', height: '20px', opacity: '0.6', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>
                      Ticket status
                    </span>
                  </div>
                  <svg className={styles.profileDropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {showStatusDropdown && (
                  <div className={styles.profileDropdown}>
                    <button
                      className={styles.profileDropdownItem}
                      onClick={() => {
                        setShowStatusDropdown(false);
                      }}
                      type="button"
                    >
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Unresolved</span>
                    </button>
                    <button
                      className={styles.profileDropdownItem}
                      onClick={() => {
                        setShowStatusDropdown(false);
                        setShowResolveModal(true);
                      }}
                      type="button"
                    >
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Resolved</span>
                    </button>
                  </div>
                )}
                
                {/* Resolve Modal */}
                {showResolveModal && (
                  <div className={styles.modalOverlay} onClick={() => setShowResolveModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                      <h3 className={styles.modalTitle}>Chat will be closed</h3>
                      <p className={styles.modalText}>
                        Are you sure you want to mark this chat as resolved?
                      </p>
                      <div className={styles.modalActions}>
                        <button
                          className={styles.modalCancelBtn}
                          onClick={() => setShowResolveModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.modalConfirmBtn}
                          onClick={handleResolve}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      )}


    </div>
  );
};

export default ContactCentre;
