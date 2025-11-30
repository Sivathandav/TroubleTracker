import styles from './ColorSelector.module.css';

const PRESET_COLORS = ['#184E7F', '#00D907', '#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7'];

const ColorSelector = ({ value, onChange, label }) => {
  const handleHexChange = (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex) || hex === '') {
      onChange(hex || value);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.selectorGroup}>
        <div className={styles.presetColors}>
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`${styles.colorBubble} ${value === color ? styles.active : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
              title={color}
            />
          ))}
          <div
            className={styles.customColorBubble}
            style={{ backgroundColor: value }}
            title="Custom color"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={handleHexChange}
          placeholder="#000000"
          className={styles.hexInput}
          maxLength="7"
        />
      </div>
    </div>
  );
};

export default ColorSelector;
