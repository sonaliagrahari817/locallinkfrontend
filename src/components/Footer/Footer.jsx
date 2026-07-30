import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiLinkedin, FiTwitter, FiMail, FiPhone, FiMapPin, FiShield } from 'react-icons/fi';
import logoImg from '../../assets/images/LocalLinkLogo.png';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-container container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo" title="LocalLink India">
            <img src={logoImg} alt="LocalLink Logo" className="footer-logo-image" />
          </Link>
          <p className="footer-description">
            India’s premier neighborhood platform connecting households and MSMEs with 100% Aadhaar-verified, top-rated local service professionals and business solution experts.
          </p>

          <div className="footer-trust-badge">
            <FiShield className="trust-icon" />
            <span>30-Day Service Guarantee & Instant UPI Refunds</span>
          </div>

          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Facebook"><FiFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram"><FiInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="LinkedIn"><FiLinkedin /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Twitter"><FiTwitter /></a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-links-column">
            <h4>Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/services">All Services</Link>
            <Link to="/nearby">Nearby Pros</Link>
            <Link to="/community">Community Forum</Link>
          </div>

          <div className="footer-links-column">
            <h4>For Professionals</h4>
            <Link to="/provider-dashboard">Provider Console</Link>
            <Link to="/offers">Special Offers</Link>
            <Link to="/contact">Help & Support</Link>
            <Link to="/contact">FAQ & Safety</Link>
          </div>

          <div className="footer-links-column contact-column">
            <h4>India HQ Contact</h4>
            <div className="contact-info-item">
              <FiPhone className="contact-icon" />
              <span>+91 98765 43210</span>
            </div>
            <div className="contact-info-item">
              <FiMail className="contact-icon" />
              <span>contact@locallink.in</span>
            </div>
            <div className="contact-info-item">
              <FiMapPin className="contact-icon" />
              <span>BBD City, Faizabad Road (Ayodhya Road), Lucknow, Uttar Pradesh - 226028</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} LocalLink India Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/contact">Privacy Policy</Link> | <Link to="/contact">Terms of Service</Link> | <Link to="/contact">Grievance Officer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
