import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import Sidebar from '../common/Sidebar';

// Tooltip Component
const Tooltip = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={styles.tooltipContainer}>
      <button
        type="button"
        className={styles.infoIcon}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => e.preventDefault()}
      >
        i
      </button>
      {showTooltip && <div className={styles.tooltip}>{text}</div>}
    </div>
  );
};

const API_URL = process.env.REACT_APP_API_URL;

const Settings = () => {
  const { user, logout, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('settings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (user && token) {
        try {
          // Fetch fresh user data from the API to ensure we have the latest info
          const response = await fetch(`${API_URL}/auth/verify`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const userData = data.user;
            setFormData((prev) => ({
              ...prev,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
            }));

          } else {
            // Fallback to user from context if API call fails
            setFormData((prev) => ({
              ...prev,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
            }));

          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          // Fallback to user from context
          setFormData((prev) => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
          }));
        }
      }
    };

    loadUserData();
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    // Check if user is changing password
    const isChangingPassword = formData.newPassword || formData.confirmPassword || formData.currentPassword;

    // If NOT changing password, validate profile fields
    if (!isChangingPassword) {
      if (!formData.firstName || !formData.firstName.trim()) {
        setError('First name is required');
        return;
      }

      if (!formData.lastName || !formData.lastName.trim()) {
        setError('Last name is required');
        return;
      }

      if (!formData.email || !formData.email.trim()) {
        setError('Email is required');
        return;
      }

      if (!isValidEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    // If password fields are filled, validate them
    if (isChangingPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return;
      }

      if (!formData.newPassword) {
        setError('New password is required');
        return;
      }

      if (!formData.confirmPassword) {
        setError('Password confirmation is required');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        setError('New password must be different from current password');
        return;
      }
    }

    try {
      setLoading(true);

      // If NOT changing password, update profile
      if (!isChangingPassword) {
        const profileResponse = await fetch(`${API_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
          }),
        });

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.message || 'Failed to update profile');
        }

        // Update user context with fresh data
        if (updateUser) {
          await updateUser();
        }
        alert('Profile updated successfully!');
      }

      // If password is being changed, update it
      if (isChangingPassword) {
        const passwordResponse = await fetch(`${API_URL}/users/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.message || 'Failed to change password');
        }

        alert('Password changed successfully! You will be logged out.');
        logout();
        navigate('/login');
      } else {
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Settings</h1>
        </header>

        {/* Content */}
        <div className={styles.contentContainer}>
          {/* Edit Profile Form */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Edit Profile</h2>
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form id="editProfileForm" onSubmit={handleSave} className={styles.form}>
              {/* Profile Section */}
              <div className={styles.formSection}>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={styles.input}
                    placeholder="Rock"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Last name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={styles.input}
                    placeholder="Lee"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={styles.input}
                      placeholder="example@email.com"
                      disabled={true}
                    />
                    <Tooltip text="Email cannot be changed. Contact administrator if you need to update your email." />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Current Password</label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className={styles.input}
                      placeholder="Enter current password"
                      disabled={loading}
                    />
                    <Tooltip text="Enter your current password to verify your identity before changing it." />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className={styles.input}
                      placeholder="Enter new password (min 6 characters)"
                      disabled={loading}
                    />
                    <Tooltip text="Changing your password will require immediate login with the new password." />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirm Password</label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={styles.input}
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <Tooltip text="You will be logged out immediately after password change for security." />
                  </div>
                </div>
              </div>

              <div className={styles.buttonRow}>
                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
