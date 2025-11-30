import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import logo from '../../assets/images/Dashboard/Vector.png';
import homeIcon from '../../assets/images/Dashboard/material-symbols-light_home-outline-rounded.png';
import messageIcon from '../../assets/images/Dashboard/bitcoin-icons_message-outline.png';
import analyticsIcon from '../../assets/images/Analytics/Analytics Logo.png';
import chatbotIcon from '../../assets/images/Dashboard/Chatbot Logo.png';
import teamsIcon from '../../assets/images/Teams/Teams Logo.png';
import settingsIcon from '../../assets/images/Settings/Settings Logo.png';
import profileIcon from '../../assets/images/Dashboard/gg_profile.png';

const Sidebar = ({ activeMenu, setActiveMenu, onLogout }) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: homeIcon, path: '/dashboard' },
    { id: 'chat', label: 'Contact Center', icon: messageIcon, path: '/contact-centre' },
    { id: 'analytics', label: 'Analytics', icon: analyticsIcon, path: '/analytics' },
    { id: 'chatbot', label: 'Chat Bot', icon: chatbotIcon, path: '/chatbot' },
    { id: 'teams', label: 'Teams', icon: teamsIcon, path: '/teams' },
    { id: 'settings', label: 'Settings', icon: settingsIcon, path: '/settings' },
  ];

  const handleNavClick = (item) => {
    setActiveMenu(item.id);
    navigate(item.path);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <img src={logo} alt="Logo" className={styles.sidebarLogo} />
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeMenu === item.id ? styles.active : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <img src={item.icon} alt={item.label} className={styles.navIcon} />
            {activeMenu === item.id && <span className={styles.navLabel}>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutIcon} onClick={onLogout}>
          <img src={profileIcon} alt="Profile" className={styles.navIcon} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
