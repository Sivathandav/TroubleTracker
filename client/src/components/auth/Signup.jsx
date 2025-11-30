import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import styles from './Login.module.css';
import logo from '../../assets/images/Landing Page/Hubly.png';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // If already authenticated, redirect to dashboard
        if (isAuthenticated) {
          navigate('/dashboard');
          return;
        }
        // Allow access to signup page for unauthenticated users
      } catch (error) {
        console.error('Error checking access:', error);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkAccess();
  }, [navigate, isAuthenticated]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Min 6 chars, at least one uppercase, one lowercase
    const hasMinLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    return hasMinLength && hasUppercase && hasLowercase;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters with uppercase and lowercase letters');
      return;
    }

    setLoading(true);

    try {
      await authService.signup(name, email, password);
      // Redirect to login after successful signup
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.formContainer}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Hubly Logo" className={styles.logoImage} />
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Name
              </label>
              <input
                type="text"
                id="name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className={styles.signupLink}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Log in
            </Link>
          </div>

          <div className={styles.footer}>
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy" className={styles.footerLink} target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="https://policies.google.com/terms" className={styles.footerLink} target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{' '}
            apply.
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.heroImage}></div>
      </div>
    </div>
  );
};

export default Signup;
