import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiMapPin, FiCheck, FiMessageSquare } from 'react-icons/fi';
import Rating from '../Rating/Rating';
import Button from '../Button/Button';
import { formatPriceText } from '../../data/formatters';
import './WorkerCard.css';

function WorkerCard({ worker, onCallClick }) {
  const navigate = useNavigate();
  const { id, _id, name, profession, rating, distance, city, area, isOpen, verified, image, pricePerHour } = worker;
  const targetId = _id || id;

  const handleCardClick = () => {
    navigate(`/worker/${targetId}`);
  };

  const handleCall = (e) => {
    e.stopPropagation();
    if (onCallClick) {
      onCallClick(worker);
    } else {
      window.location.href = `tel:${worker.phone}`;
    }
  };

  const handleChat = (e) => {
    e.stopPropagation();
    navigate(`/chat?workerId=${encodeURIComponent(targetId)}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(image || '')}`);
  };

  const displayPrice = formatPriceText(pricePerHour);

  return (
    <motion.div
      className="worker-card"
      onClick={handleCardClick}
      whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
      layout
    >
      <div className="worker-image-container">
        <img src={image} alt={name} className="worker-card-image" />
        <span className={`status-badge ${isOpen ? 'status-open' : 'status-closed'}`}>
          {isOpen ? 'Available Now' : 'Busy'}
        </span>
        {pricePerHour && <span className="price-tag">{displayPrice}</span>}
      </div>

      <div className="worker-info">
        <div className="worker-header">
          <h3 className="worker-name">
            {name}
            {verified && (
              <span className="verified-icon-badge" title="KYC & Aadhaar Verified">
                <FiCheck className="verified-icon" />
              </span>
            )}
          </h3>
          <span className="worker-profession">{profession}</span>
        </div>

        <div className="worker-details">
          <Rating value={rating} text={`${rating}`} />
          <div className="worker-distance">
            <FiMapPin className="distance-icon" />
            <span>{area ? `${area}, ${city || ''}` : (distance || 'Nearby')}</span>
          </div>
        </div>

        <div className="worker-action" style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={handleCall} style={{ flex: 1 }} icon={FiPhone}>
            Call
          </Button>
          <Button variant="primary" size="sm" onClick={handleChat} style={{ flex: 1 }} icon={FiMessageSquare}>
            Chat
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default WorkerCard;
