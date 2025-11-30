import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';
import FloatingChatWidget from '../FloatingChatWidget/FloatingChatWidget';
import heroImage from '../../assets/images/Landing Page/Rectangle 2074.png';
import watchVideoIcon from '../../assets/images/Landing Page/Group 1000014526.png';
import card1 from '../../assets/images/Landing Page/Card 1.png';
import calendar from '../../assets/images/Landing Page/Calendar.png';
import frame22 from '../../assets/images/Landing Page/Frame 2147223822.png';
import frame1 from '../../assets/images/Landing Page/Frame 2147223816.png';
import funnelImage from '../../assets/images/Landing Page/Funnel.png';
import socialMediaIcons from '../../assets/images/Landing Page/Social media.png';
import hublyLogo from '../../assets/images/Landing Page/Hubly.png';
import socialIcons from '../../assets/images/Landing Page/div.flex.png';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <img src={hublyLogo} alt="Hubly" className={styles.logo} />
            <span className={styles.logoText}>Hubly</span>
          </div>
          {/* Nav links removed as per request */}
          <div className={styles.authButtons}>
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>
              Login
            </button>
            <button className={styles.signupBtn} onClick={() => navigate('/signup')}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>
              Grow Your Business Faster with Hubly CRM
            </h1>
            <p className={styles.heroSubtitle}>
              Manage leads, automate workflows, and close deals effortlessly—all in one powerful platform.
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.ctaButton} onClick={() => navigate('/signup')}>
                Get Started <span className={styles.arrow}>→</span>
              </button>
              <button className={styles.watchVideoBtn}>
                <img src={watchVideoIcon} alt="Play" className={styles.playIcon} />
                Watch Video
              </button>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.imageWrapper}>
              <img src={heroImage} alt="Dashboard Preview" className={styles.heroImage} />

              {/* Decorative Elements */}
              <img src={card1} alt="" className={`${styles.decoration} ${styles.card1}`} />
              <img src={calendar} alt="" className={`${styles.decoration} ${styles.calendar}`} />
              <img src={frame22} alt="" className={`${styles.decoration} ${styles.frame22}`} />
            </div>
          </div>
        </div>
      </section>

      {/* Companies/Logos Section */}
      <section className={styles.companiesSection}>
        <img src={frame1} alt="Trusted Companies" className={styles.companiesImage} />
      </section>

      {/* CRM Section - Page 2 */}
      <section className={styles.crmSection}>
        <div className={styles.crmContent}>
          <h2 className={styles.crmTitle}>
            At its core, Hubly is a robust CRM solution.
          </h2>
          <p className={styles.crmDescription}>
            Hubly helps businesses streamline customer interactions, track leads, and automate tasks—
            saving you time and maximizing revenue. Whether you're a startup or an enterprise, Hubly
            adapts to your needs, giving you the tools to scale efficiently.
          </p>

          <div className={styles.crmCard}>
            <div className={styles.crmCardLeft}>
              <div className={styles.crmFeature}>
                <h3 className={styles.crmFeatureTitle}>MULTIPLE PLATFORMS TOGETHER!</h3>
                <p className={styles.crmFeatureDesc}>
                  Email communication is a breeze with our fully integrated, drag & drop email builder.
                </p>
              </div>

              <div className={styles.crmFeature}>
                <h3 className={styles.crmFeatureTitle}>CLOSE</h3>
                <p className={styles.crmFeatureDesc}>
                  Capture leads using our landing pages, surveys, forms, calendars, inbound phone system & more!
                </p>
              </div>

              <div className={styles.crmFeature}>
                <h3 className={styles.crmFeatureTitle}>NURTURE</h3>
                <p className={styles.crmFeatureDesc}>
                  Capture leads using our landing pages, surveys, forms, calendars, inbound phone system & more!
                </p>
              </div>
            </div>

            <div className={styles.crmCardRight}>
              <div className={styles.funnelContainer}>
                <div className={styles.socialMediaBackground}>
                  <img src={socialMediaIcons} alt="Social Media Platforms" className={styles.socialMediaIcons} />
                </div>
                <div className={styles.funnelWrapper}>
                  <img src={funnelImage} alt="Sales Funnel" className={styles.funnelImage} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Page 3 */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingContent}>
          <h2 className={styles.pricingTitle}>We have plans for everyone!</h2>
          <p className={styles.pricingDescription}>
            We started with a strong foundation, then simply built all of the sales and
            marketing tools ALL businesses need under one platform.
          </p>

          <div className={styles.pricingGrid}>
            {/* Starter Plan */}
            <div className={styles.pricingCard}>
              <h3 className={styles.planName}>STARTER</h3>
              <p className={styles.planDescription}>
                Best for local businesses needing to improve their online reputation.
              </p>
              <div className={styles.priceSection}>
                <span className={styles.price}>$199</span>
                <span className={styles.billingPeriod}>/monthly</span>
              </div>

              <div className={styles.featuresSection}>
                <h4 className={styles.featuresTitle}>What's included</h4>
                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited Users
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    GMB Messaging
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Reputation Management
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    GMB Call Tracking
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    24/7 Award Winning Support
                  </li>
                </ul>
              </div>

              <button className={styles.signupButton}>SIGN UP FOR STARTER</button>
            </div>

            {/* Grow Plan */}
            <div className={styles.pricingCard}>
              <h3 className={styles.planName}>GROW</h3>
              <p className={styles.planDescription}>
                Best for all businesses that want to take full control of their marketing automation and track their leads, click to close.
              </p>
              <div className={styles.priceSection}>
                <span className={styles.price}>$399</span>
                <span className={styles.billingPeriod}>/monthly</span>
              </div>

              <div className={styles.featuresSection}>
                <h4 className={styles.featuresTitle}>What's included</h4>
                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Pipeline Management
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Marketing Automation Campaigns
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Live Call Transfer
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    GMB Messaging
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Embed-able Form Builder
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Reputation Management
                  </li>
                  <li className={styles.featureItem}>
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    24/7 Award Winning Support
                  </li>
                </ul>
              </div>

              <button className={styles.signupButton}>SIGN UP FOR STARTER</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <img src={hublyLogo} alt="Hubly" className={styles.footerLogo} />
            <span className={styles.footerBrand}>Hubly</span>
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerTopRow}>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>Product</h4>
                <a href="#universal-checkout" className={styles.footerLink}>Universal checkout</a>
                <a href="#payment-workflows" className={styles.footerLink}>Payment workflows</a>
                <a href="#observability" className={styles.footerLink}>Observability</a>
                <a href="#upliftai" className={styles.footerLink}>UpliftAI</a>
                <a href="#apps-integrations" className={styles.footerLink}>Apps & integrations</a>
              </div>

              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>Why Primer</h4>
                <a href="#expand-markets" className={styles.footerLink}>Expand to new markets</a>
                <a href="#boost-success" className={styles.footerLink}>Boost payment success</a>
                <a href="#improve-conversion" className={styles.footerLink}>Improve conversion rates</a>
                <a href="#reduce-fraud" className={styles.footerLink}>Reduce payments fraud</a>
                <a href="#recover-revenue" className={styles.footerLink}>Recover revenue</a>
              </div>

              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>Developers</h4>
                <a href="#primer-docs" className={styles.footerLink}>Primer Docs</a>
                <a href="#api-reference" className={styles.footerLink}>API Reference</a>
                <a href="#payment-methods" className={styles.footerLink}>Payment methods guide</a>
                <a href="#service-status" className={styles.footerLink}>Service status</a>
                <a href="#community" className={styles.footerLink}>Community</a>
              </div>
            </div>

            <div className={styles.footerBottomRow}>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>Resources</h4>
                <a href="#blog" className={styles.footerLink}>Blog</a>
                <a href="#success-stories" className={styles.footerLink}>Success stories</a>
                <a href="#news-room" className={styles.footerLink}>News room</a>
                <a href="#terms" className={styles.footerLink}>Terms</a>
                <a href="#privacy" className={styles.footerLink}>Privacy</a>
              </div>

              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>Company</h4>
                <a href="#careers" className={styles.footerLink}>Careers</a>
              </div>

              <div className={styles.footerSocialContainer}>
                <img src={socialIcons} alt="Social Media" className={styles.footerSocialIcons} />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
};

export default Landing;
