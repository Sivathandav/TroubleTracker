import React from 'react';
import styles from './FixedToast.module.css';

const FixedToast = ({ message, onClose }) => {
  // Truncate message to 20 words max
  const truncateMessage = (text, wordLimit = 20) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  const displayMessage = truncateMessage(message);

  return (
    <div className={styles.fixedToast}>
      <div className={styles.toastHeader}>
        <img
          src={require('../../assets/images/Landing Page/Ellipse 6.png')}
          alt="Avatar"
          className={styles.toastAvatar}
        />
        <button
          className={styles.toastCloseBtn}
          onClick={onClose}
          aria-label="Close toast"
        >
          <img
            src={require('../../assets/images/Landing Page/cross 1.png')}
            alt="Close"
            className={styles.toastCloseIcon}
          />
        </button>
      </div>
      <div className={styles.toastContent}>
        <p className={styles.toastText}>{displayMessage}</p>
      </div>
    </div>
  );
};

export default FixedToast;
