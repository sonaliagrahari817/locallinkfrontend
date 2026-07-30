import React from 'react';
import Rating from '../Rating/Rating';
import './ReviewCard.css';

function ReviewCard({ review }) {
  const { user, avatar, rating, date, comment } = review;

  return (
    <div className="review-card">
      <div className="review-header">
        <img src={avatar} alt={user} className="review-avatar" />
        <div className="review-user-info">
          <h4 className="review-user-name">{user}</h4>
          <span className="review-date">{date}</span>
        </div>
        <Rating value={rating} className="review-stars" />
      </div>
      <p className="review-comment">"{comment}"</p>
    </div>
  );
}

export default ReviewCard;
