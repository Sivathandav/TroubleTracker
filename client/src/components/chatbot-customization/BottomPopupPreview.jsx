import styles from './BottomPopupPreview.module.css';
import ellipseAvatar from '../../assets/images/ChatBot/Ellipse 6.png';

const BottomPopupPreview = ({ settings }) => {
  return (
    <div className={styles.container}>
      <div className={styles.popupCard}>
        <div className={styles.popupHeader}>
          <img 
            src={ellipseAvatar} 
            alt="Bot Avatar" 
            className={styles.avatar}
          />
          <button className={styles.closeBtn}>✕</button>
        </div>
        <div className={styles.popupContent}>
          <p className={styles.popupText}>
            👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BottomPopupPreview;
