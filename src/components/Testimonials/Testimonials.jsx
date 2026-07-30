import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiHeart } from 'react-icons/fi';
import { testimonials } from '../../data/dummyData';
import './Testimonials.css';

function Testimonials() {
  return (
    <section className="testimonials-section container">
      <div className="section-header text-center">
        <span className="section-badge">
          <FiHeart className="badge-icon" /> Trusted Across India
        </span>
        <h2>Loved by Thousands of Indian Households</h2>
        <p className="section-subtitle">
          See how LocalConnect connects homeowners and local businesses with top verified service professionals.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((item, idx) => (
          <motion.div
            key={item.id}
            className="testimonial-card glass"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.15 }}
          >
            <div className="testimonial-rating">
              {[...Array(item.rating)].map((_, i) => (
                <FiStar key={i} className="star-icon filled" />
              ))}
            </div>
            <p className="testimonial-quote">"{item.quote}"</p>
            <div className="testimonial-user flex items-center gap-3">
              <img src={item.avatar} alt={item.name} className="user-avatar" />
              <div>
                <h4 className="user-name">{item.name}</h4>
                <span className="user-role">{item.role}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
