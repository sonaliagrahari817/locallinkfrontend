import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCalendar, FiTag } from 'react-icons/fi';
import Button from '../Button/Button';
import { formatINR } from '../../data/formatters';
import './OfferCard.css';

function OfferCard({ offer, onBookClick }) {
  const { title, discount, code, validUntil, serviceName, price, originalPrice } = offer;

  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  const displayPrice = formatINR(price);
  const displayOrigPrice = originalPrice ? formatINR(originalPrice) : null;

  return (
    <motion.div
      className="offer-card"
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="offer-badge-ribbon">{discount}</div>
      <div className="offer-main">
        <div className="offer-header">
          <FiTag className="offer-tag-icon" />
          <h3 className="offer-title">{title}</h3>
        </div>
        
        <p className="offer-service">{serviceName}</p>

        <div className="offer-pricing">
          <span className="offer-price">{displayPrice}</span>
          {displayOrigPrice && <span className="offer-orig-price">{displayOrigPrice}</span>}
        </div>

        <div className="offer-footer">
          <div className="offer-code-box" onClick={copyCode} title="Click to copy coupon code">
            <span className="offer-code">{code}</span>
            <FiCopy className="offer-copy-icon" />
          </div>

          <div className="offer-date">
            <FiCalendar />
            <span>Till {validUntil}</span>
          </div>
        </div>
      </div>
      
      <div className="offer-action-btn">
        <Button variant="gradient" size="sm" onClick={onBookClick}>
          Claim Offer
        </Button>
      </div>
    </motion.div>
  );
}

export default OfferCard;
