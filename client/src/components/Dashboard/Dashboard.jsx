import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import Sidebar from '../common/Sidebar';
import searchIcon from '../../assets/images/Dashboard/search-normal.png';
import smsIcon from '../../assets/images/Dashboard/sms.png';

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        setTickets(data.tickets || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token]);

  // Search tickets by ticketId
  const handleSearch = async () => {
    setSearchError('');
    
    if (!searchQuery.trim()) {
      // Reload all tickets if search is empty
      try {
        const response = await fetch(`${API_URL}/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTickets(data.tickets || []);
      } catch (err) {
        setError('Failed to reload tickets');
      }
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tickets/search?ticketId=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setSearchError('Ticket not found');
        setTickets([]);
        return;
      }

      const data = await response.json();
      setTickets(data.tickets || []);
      
      if (!data.tickets || data.tickets.length === 0) {
        setSearchError('Ticket not found');
      }
    } catch (err) {
      setSearchError('Ticket not found');
      setTickets([]);
    }
  };

  // Filter tickets based on active tab
  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === 'resolved') return ticket.status === 'resolved';
    if (activeTab === 'unresolved') return ticket.status !== 'resolved';
    return true;
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };



  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
        </header>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <img src={searchIcon} alt="Search" className={styles.searchIconImg} />
            <input
              type="text"
              placeholder="Search for ticket"
              value={searchQuery}
              onChange={async (e) => {
                const newValue = e.target.value;
                setSearchQuery(newValue);
                
                // If search is cleared, reload all tickets
                if (!newValue.trim()) {
                  setSearchError('');
                  try {
                    const response = await fetch(`${API_URL}/tickets`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    const data = await response.json();
                    setTickets(data.tickets || []);
                  } catch (err) {
                    setError('Failed to reload tickets');
                  }
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={async () => {
                  setSearchQuery('');
                  setSearchError('');
                  // Reload all tickets
                  try {
                    const response = await fetch(`${API_URL}/tickets`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    const data = await response.json();
                    setTickets(data.tickets || []);
                  } catch (err) {
                    setError('Failed to reload tickets');
                  }
                }}
                className={styles.clearButton}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsHeader}>
            <button
              className={`${styles.tab} ${styles.tabWithIcon} ${activeTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <img src={smsIcon} alt="SMS" className={styles.smsIcon} />
              All Tickets
            </button>
          </div>
          <button
            className={`${styles.tab} ${activeTab === 'resolved' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            Resolved
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'unresolved' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('unresolved')}
          >
            Unresolved
          </button>
        </div>

        {/* Tickets List */}
        <div className={styles.ticketsContainer}>
          {loading && <p className={styles.loadingText}>Loading tickets...</p>}
          {error && <p className={styles.errorText}>{error}</p>}
          {searchError && <p className={styles.errorText}>{searchError}</p>}
          {!loading && !error && !searchError && filteredTickets.length === 0 && (
            <p className={styles.emptyText}>No tickets found</p>
          )}
          {!loading && !error && filteredTickets.map((ticket) => {
            const lastMessage = ticket.messages && ticket.messages.length > 0
              ? ticket.messages[ticket.messages.length - 1]
              : null;
            const userName = ticket.userContactInfo?.name || ticket.name || 'Unknown User';
            const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

            return (
              <div key={ticket._id} className={styles.ticketCard}>
                <div className={styles.ticketHeader}>
                  <div className={styles.ticketInfo}>
                    <span className={`${styles.statusBadge} ${styles[ticket.status]}`}>
                      {ticket.status === 'resolved' ? '✅' : '🟠'}
                    </span>
                    <span className={styles.ticketId}>Ticket# {ticket.ticketId}</span>
                    {ticket.assignedTo && (
                      <span className={styles.assignedTo}>
                        Assigned to: {ticket.assignedTo.name}
                      </span>
                    )}
                  </div>
                  <span className={styles.ticketPosted}>
                    Posted at {formatDate(ticket.createdAt)}
                  </span>
                </div>

                <div className={styles.ticketBody}>
                  {ticket.status === 'resolved' ? (
                    <div className={styles.resolvedInfo}>
                      <p className={styles.resolvedText}>Ticket resolved</p>
                      <span className={styles.resolutionTime}>
                        {new Date(ticket.resolvedAt).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                  ) : (
                    <>
                      {lastMessage && (
                        <>
                          <p className={styles.ticketMessage}>
                            {lastMessage.body || lastMessage.content}
                          </p>
                          <span className={styles.ticketTime}>
                            {new Date(lastMessage.timestamp).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.ticketFooter}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {userInitials}
                    </div>
                    <p className={styles.userName}>{userName}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
