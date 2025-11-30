import styles from './ColorSwatch.module.css';

const ColorSwatch = ({ value, onChange }) => {
  const PRESET_COLORS = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' },
    { name: 'Blue-Gray', hex: '#33475B' },
    { name: 'Light Blue', hex: '#E3F2FD' },
    { name: 'Sky Blue', hex: '#87CEEB' },
  ];

  return (
    <div className={styles.swatchContainer}>
      {/* Preset Color Circles */}
      <div className={styles.presetColors}>
        {PRESET_COLORS.map((color) => (
          <button
            key={color.hex}
            className={`${styles.presetCircle} ${value === color.hex ? styles.active : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => onChange(color.hex)}
            title={color.name}
            type="button"
          />
        ))}
      </div>

      {/* Custom Color Input Row */}
      <div className={styles.customColorRow}>
        <div
          className={styles.colorPreview}
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.hexInput}
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

export default ColorSwatch;
