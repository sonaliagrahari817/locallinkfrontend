import React from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import './Rating.css';

function Rating({ value, text, className = '' }) {
  const stars = [];
  const roundedValue = Math.round(value * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (i <= value) {
      stars.push(<FaStar key={i} className="star filled" />);
    } else if (i - 0.5 === roundedValue) {
      stars.push(<FaStarHalfAlt key={i} className="star half" />);
    } else {
      stars.push(<FiStar key={i} className="star empty" />);
    }
  }

  return (
    <div className={`rating-container ${className}`}>
      <div className="stars-wrapper">{stars}</div>
      {text && <span className="rating-text">{text}</span>}
    </div>
  );
}

export default Rating;
