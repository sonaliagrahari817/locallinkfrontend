import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiActivity, FiEye, FiEyeOff, FiCheckCircle, FiAlertTriangle, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import logoImg from '../../assets/images/LocalLinkLogo.png';
import './Login.css';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000; // 1 minute

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  const from = location.state?.from?.pathname || '/';
  const lockTimerRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const getRemainingLockSeconds = () => {
    if (!lockedUntil) return 0;
    return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check lockout
    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = getRemainingLockSeconds();
      setError(`Too many failed attempts. Please try again in ${secs} second${secs !== 1 ? 's' : ''}.`);
      return;
    } else if (lockedUntil && Date.now() >= lockedUntil) {
      // Lockout expired – reset
      setLockedUntil(null);
      setLoginAttempts(0);
    }

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = formData.email.trim();
      const result = await login(cleanEmail, formData.password);
      // Reset attempts on success
      setLoginAttempts(0);
      setLockedUntil(null);

      const loggedUser = result?.user;
      const userRole = loggedUser?.role;

      // Role-based routing: Provider/Admin -> Provider Dashboard, Customer -> Customer Panel Home
      let targetPath = '/';
      if (userRole === 'provider' || userRole === 'admin') {
        targetPath = '/provider-dashboard';
      } else {
        targetPath = '/';
      }

      // Show success popup
      setSuccessName(loggedUser?.name || cleanEmail.split('@')[0]);
      setShowSuccess(true);

      // Fast responsive navigate
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 400);
    } catch (err) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockedUntil(lockTime);
        setError(`Account temporarily locked due to ${MAX_LOGIN_ATTEMPTS} failed attempts. Please wait 60 seconds before trying again.`);
        // Auto-unlock after duration
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          setLockedUntil(null);
          setLoginAttempts(0);
          setError('');
        }, LOCKOUT_DURATION_MS);
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
        const serverMsg = err.response?.data?.message || '';
        if (serverMsg.toLowerCase().includes('invalid') || err.response?.status === 401) {
          setError(`Wrong password! Please check your credentials and try again. (${remaining} attempt${remaining !== 1 ? 's' : ''} remaining)`);
        } else {
          setError(serverMsg || 'Login failed. Please check your credentials and try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-bg">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* ── Success Popup Overlay ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="auth-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="auth-success-popup"
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
            >
              <div className="success-icon-ring">
                <FiCheckCircle className="success-icon" />
              </div>
              <h2>Login Successful!</h2>
              <p>Welcome back, <strong>{successName}</strong></p>
              <span className="success-redirect-text">Redirecting you now…</span>
              <div className="success-progress-bar">
                <motion.div
                  className="success-progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.6, ease: 'linear' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="auth-card glass"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <Link to="/" className="auth-logo" title="LocalLink Home">
            <img src={logoImg} alt="LocalLink Logo" className="auth-logo-img" />
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to access your account and local services</p>
        </div>

        {/* ── Error Message ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              className={`auth-error-box ${lockedUntil ? 'auth-error-locked' : ''}`}
              initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              {lockedUntil ? (
                <FiShield className="error-icon" />
              ) : (
                <FiAlertTriangle className="error-icon" />
              )}
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label><FiMail className="field-icon" /> Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. aarav@gmail.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label><FiLock className="field-icon" /> Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-100 auth-submit-btn"
            disabled={loading || !!(lockedUntil && Date.now() < lockedUntil)}
            icon={FiLogIn}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Create Account</Link></p>
        </div>

        <div className="auth-demo-hint" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontWeight: 700, marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Quick Demo Logins:</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setFormData({ email: 'amansrh@gmail.com', password: 'demo123456' });
              }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              👤 Aman (amansrh@gmail.com)
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ email: 'customer@localconnect.in', password: 'demo123456' });
              }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ email: 'provider@localconnect.in', password: 'demo123456' });
              }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              ⚡ Provider
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
