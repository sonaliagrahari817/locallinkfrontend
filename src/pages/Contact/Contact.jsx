import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheckCircle, FiFacebook, FiInstagram, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/Button/Button';
import IndiaMap from '../../components/IndiaMap/IndiaMap';
import { contactAPI } from '../../utils/api';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Bengaluru',
    service: 'General Query',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Valid 10-digit Indian phone number is required';
    if (!formData.message.trim()) newErrors.message = 'Please type your message';
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await contactAPI.submit(formData);
    } catch (err) {
      console.log('Local contact submit fallback');
    } finally {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          city: 'Bengaluru',
          service: 'General Query',
          message: ''
        });
      }, 4000);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <Navbar />

      <main className="contact-main-content">
        {/* Contact Hero */}
        <section className="contact-hero-section">
          <div className="container text-center">
            <motion.span
              className="contact-badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              We're Here to Help
            </motion.span>

            <motion.h1
              className="contact-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Get in Touch with Local Link India
            </motion.h1>

            <motion.p
              className="contact-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Have a question about booking a professional or registering your local business? Our support team in Bengaluru is ready to assist you 24/7.
            </motion.p>
          </div>
        </section>

        {/* Contact Grid Section */}
        <section className="container contact-grid-container">
          {/* Info Side Cards */}
          <div className="contact-info-cards">
            <div className="info-card glass">
              <div className="info-icon-box">
                <FiPhone />
              </div>
              <div className="info-content">
                <h4>Phone Support (24/7)</h4>
                <p><strong>+91 98765 43210</strong></p>
                <span>Toll-free customer hotline</span>
              </div>
            </div>

            <div className="info-card glass">
              <div className="info-icon-box">
                <FiMail />
              </div>
              <div className="info-content">
                <h4>Email Support</h4>
                <p><strong>contact@localconnect.in</strong></p>
                <span>Fast response within 2 hours</span>
              </div>
            </div>

            <div className="info-card glass">
              <div className="info-icon-box">
                <FiMapPin />
              </div>
              <div className="info-content">
                <h4>India Headquarters</h4>
                <p><strong>Alambagh Bus Stand Market, Lucknow, Uttar Pradesh, India</strong></p>
                <span>Alambagh Hub, Pin: 226005</span>
              </div>
            </div>

            <div className="info-card glass">
              <div className="info-icon-box">
                <FiClock />
              </div>
              <div className="info-content">
                <h4>Operating Hours</h4>
                <p><strong>Mon - Sun: 07:00 AM - 10:00 PM</strong></p>
                <span>Emergency helpline active 24/7</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="contact-socials-box glass">
              <h4>Follow Our Indian Network</h4>
              <div className="contact-social-icons">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn"><FiFacebook /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn"><FiInstagram /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-btn"><FiLinkedin /></a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-btn"><FiTwitter /></a>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-card glass">
            <h3>Send Us a Message</h3>
            <p className="form-sub-text">Fill out the form below and our team in Bengaluru will get back to you.</p>

            {submitted ? (
              <motion.div
                className="contact-success-box"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <FiCheckCircle className="success-icon" />
                <h4>Thank You! Message Sent Successfully.</h4>
                <p>Our representative will contact you at <strong>{formData.phone || formData.email}</strong> shortly.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Yogesh Singh Rana"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? 'has-error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. yugh@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'has-error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number (+91) *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? 'has-error' : ''}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <select name="city" value={formData.city} onChange={handleChange}>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Kanpur">Kanpur</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Pune">Pune</option>
                      <option value="Kolkata">Kolkata</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Service / Category Query</label>
                  <select name="service" value={formData.service} onChange={handleChange}>
                    <option value="General Query">General Inquiry</option>
                    <option value="Electrician & Smart Home">Electrician & Smart Home</option>
                    <option value="Plumbing & Geyser">Plumbing & Geyser Fitting</option>
                    <option value="Salon & Beauty at Home">Salon & Beauty at Home</option>
                    <option value="Home Deep Cleaning">Home Deep Cleaning</option>
                    <option value="Web & App Development">Web & App Development</option>
                    <option value="Become a Partner">Become a Verified Service Partner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Your Message *</label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? 'has-error' : ''}
                  ></textarea>
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <Button variant="gradient" size="lg" className="w-100 btn-submit" icon={FiSend} disabled={loading}>
                  {loading ? 'Sending Inquiry...' : 'Submit Inquiry'}
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* Map Section */}
        <section className="container mt-12">
          <IndiaMap selectedCity="Bengaluru" />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
