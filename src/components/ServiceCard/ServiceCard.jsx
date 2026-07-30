import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiZap, 
  FiDroplet, 
  FiWind, 
  FiTool, 
  FiShoppingBag, 
  FiPlusCircle, 
  FiMapPin, 
  FiStar, 
  FiPhoneCall, 
  FiCpu
} from 'react-icons/fi';
import { MdCleaningServices } from 'react-icons/md';
import { GiBroom } from 'react-icons/gi';
import { HiSparkles } from 'react-icons/hi2';
import Button from '../Button/Button';
import { formatINR } from '../../data/formatters';
import './ServiceCard.css';

const iconMap = {
  FiZap: FiZap,
  FiDroplet: FiDroplet,
  FiWind: FiWind,
  FiTool: FiTool,
  FiCpu: FiCpu,
  FiShoppingBag: FiShoppingBag,
  FiPlusCircle: FiPlusCircle,
  MdCleaningServices: MdCleaningServices,
  GiBroom: GiBroom,
  HiSparkles: HiSparkles,
  FiSparkles: HiSparkles
};

// Theme configurations for colorful card styles & watermarks
const categoryThemes = {
  electrician: {
    themeClass: 'theme-electrician',
    iconBg: 'bg-purple-gradient',
    iconColor: '#ffffff',
    badgeText: 'Verified Pro',
    badgeClass: 'badge-purple',
    fallbackIcon: FiZap
  },
  plumber: {
    themeClass: 'theme-plumber',
    iconBg: 'bg-cyan-light',
    iconColor: '#0284c7',
    badgeText: 'Licensed Pro',
    badgeClass: 'badge-peach',
    fallbackIcon: FiDroplet
  },
  cleaning: {
    themeClass: 'theme-cleaning',
    iconBg: 'bg-emerald-light',
    iconColor: '#059669',
    badgeText: 'Eco Assured',
    badgeClass: 'badge-green',
    fallbackIcon: MdCleaningServices
  },
  carpenter: {
    themeClass: 'theme-carpenter',
    iconBg: 'bg-amber-light',
    iconColor: '#d97706',
    badgeText: 'Craftsman',
    badgeClass: 'badge-amber',
    fallbackIcon: FiTool
  },
  grocery: {
    themeClass: 'theme-grocery',
    iconBg: 'bg-rose-light',
    iconColor: '#e11d48',
    badgeText: 'Express 20m',
    badgeClass: 'badge-rose',
    fallbackIcon: FiShoppingBag
  },
  pharmacy: {
    themeClass: 'theme-pharmacy',
    iconBg: 'bg-red-light',
    iconColor: '#dc2626',
    badgeText: '24/7 Active',
    badgeClass: 'badge-red',
    fallbackIcon: FiPlusCircle
  }
};

function ServiceCard({ service, onBookClick }) {
  const title = service.title || service.name;
  const description = service.description || 'Verified local service provided by trained, Aadhaar-verified specialists.';
  const distance = service.distance || '1.2 km away';
  const area = service.area || 'Nearby Area';
  const rating = service.rating || 4.8;
  const reviewsCount = service.reviewsCount || 1750;
  const price = service.price;
  const tag = service.tag || 'Licensed Pro';
  const phone = service.phone || '+91 98765 43210';
  const categoryKey = (service.category || 'electrician').toLowerCase();

  const theme = categoryThemes[categoryKey] || categoryThemes.electrician;
  
  // Pick icon: from iconMap or category fallbackIcon or FiZap
  const IconComponent = iconMap[service.icon] || theme.fallbackIcon || FiZap;

  return (
    <motion.div
      className={`nearby-service-card ${theme.themeClass}`}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.25, type: 'spring', stiffness: 200 }}
    >
      {/* Gold glowing border particles frame */}
      <div className="card-border-glow-frame">
        <span className="sparkle-particle sparkle-1"></span>
        <span className="sparkle-particle sparkle-2"></span>
        <span className="sparkle-particle sparkle-3"></span>
        <span className="sparkle-particle sparkle-4"></span>
      </div>

      {/* Large Watermark Icon in background */}
      <div className="card-watermark-bg">
        <IconComponent />
      </div>

      {/* Top Bar: Icon Logo & Badges */}
      <div className="card-header-bar">
        <div className={`colorful-icon-box ${theme.iconBg}`}>
          <IconComponent className="service-icon" style={{ color: theme.iconColor }} />
        </div>

        <div className="header-badges">
          <span className={`licensed-badge ${theme.badgeClass}`}>
            {tag || theme.badgeText}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="card-body-content">
        <h3 className="service-title-text">{title}</h3>

        <div className="tag-meta-row">
          <span className="location-meta-pill">
            <FiMapPin className="pill-icon" /> {area} ({distance})
          </span>
        </div>

        <p className="service-desc-text">{description}</p>

        {/* Rating Stars Row */}
        <div className="rating-stars-row">
          <div className="stars-group">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={`star-icon ${star <= Math.floor(rating) ? 'filled' : star - rating < 1 ? 'half' : ''}`}
              />
            ))}
          </div>
          <span className="rating-score-text">{rating}</span>
          <span className="reviews-count-text">({reviewsCount.toLocaleString()})</span>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="card-footer-action">
        <div className="price-tag-box">
          <span className="price-label">Fee</span>
          <span className="price-amount">{formatINR(price)}</span>
        </div>

        <div className="action-buttons-group">
          <Button 
            variant="outline" 
            size="sm" 
            className="btn-call-mini"
            onClick={() => window.location.href = `tel:${phone}`}
            icon={FiPhoneCall}
            title="Call Pro"
          >
            Call
          </Button>
          <Button 
            variant="gradient" 
            size="sm" 
            className="btn-book-mini"
            onClick={() => onBookClick && onBookClick(service)}
          >
            Book Pro
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default ServiceCard;
