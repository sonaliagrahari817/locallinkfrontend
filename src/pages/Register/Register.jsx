import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus, FiActivity, FiEye, FiEyeOff, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import logoImg from '../../assets/images/LocalLinkLogo.png';
import '../Login/Login.css';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role,
      });

      const registeredUser = result?.user;
      const userRole = registeredUser?.role || formData.role;

      let targetPath = '/';
      if (userRole === 'provider' || userRole === 'admin') {
        targetPath = '/provider-dashboard';
      } else {
        targetPath = '/';
      }

      // Show success popup
      setSuccessName(registeredUser?.name || formData.name.trim());
      setShowSuccess(true);

      // Navigate after popup
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information and try again.');
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
              <h2>Registration Successful!</h2>
              <p>Welcome, <strong>{successName}</strong></p>
              <span className="success-redirect-text">Setting up your account…</span>
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
        className="auth-card register-card glass"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-header">
          <Link to="/" className="auth-logo" title="LocalLink Home">
            <img src={logoImg} alt="LocalLink Logo" className="auth-logo-img" />
          </Link>
          <h1>Create Account</h1>
          <p>Join India's premier local services platform</p>
        </div>

        {error && (
          <motion.div
            className="auth-error-box"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Account Type Selector */}
          <div className="auth-field">
            <label>I want to</label>
            <div className="auth-role-selector">
              <button
                type="button"
                className={`role-option ${formData.role === 'user' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'user' })}
              >
                <FiUser className="role-option-icon" />
                Find Local Services
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'provider' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'provider' })}
              >
                <FiBriefcase className="role-option-icon" />
                Provide Local Services
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label><FiUser className="field-icon" /> Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-row">
            <div className="auth-field">
              <label><FiMail className="field-icon" /> Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="aarav@gmail.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
            <div className="auth-field">
              <label><FiPhone className="field-icon" /> Mobile Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="auth-form-row">
            <div className="auth-field">
              <label><FiLock className="field-icon" /> Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
            <div className="auth-field">
              <label><FiLock className="field-icon" /> Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-100 auth-submit-btn"
            disabled={loading}
            icon={FiUserPlus}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
