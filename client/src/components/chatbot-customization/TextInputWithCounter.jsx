import { useState, useEffect } from 'react';
import styles from './TextInputWithCounter.module.css';

const TextInputWithCounter = ({ value, onChange, label, maxLength = 50, icon = '✏️' }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= maxLength) {
      onChange(val);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>{label}</label>
        <span className={styles.counter}>
          {value.length}/{maxLength}
        </span>
      </div>
      <div className={`${styles.inputWrapper} ${isFocused ? styles.focused : ''}`}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={styles.input}
          placeholder="Enter text..."
          maxLength={maxLength}
        />
        <span className={styles.icon}>{icon}</span>
      </div>
    </div>
  );
};

export default TextInputWithCounter;
