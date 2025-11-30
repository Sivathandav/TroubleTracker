import { useState } from 'react';
import styles from './TextEditorTile.module.css';

const TextEditorTile = ({ label, value, onChange, multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={styles.editingContainer}>
        {multiline ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className={styles.textarea}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className={styles.input}
            autoFocus
          />
        )}
        <div className={styles.editingActions}>
          <button className={styles.cancelBtn} onClick={handleCancel}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tile}>
      <div className={styles.tileContent}>
        <div className={styles.tileLabel}>{label}</div>
        <div className={styles.tileValue}>{value}</div>
      </div>
      <button
        className={styles.editBtn}
        onClick={() => setIsEditing(true)}
        title="Edit"
      >
        ✏️
      </button>
    </div>
  );
};

export default TextEditorTile;
