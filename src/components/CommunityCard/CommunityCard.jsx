import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiSend } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import './CommunityCard.css';

function CommunityCard({ post, onMessageClick }) {
  const { name, avatar, time, category, description, likes: initialLikes, commentsCount } = post;
  
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const getCategoryClass = (cat) => {
    switch (cat.toLowerCase()) {
      case 'looking for': return 'cat-looking';
      case 'for sale': return 'cat-sale';
      case 'lost & found': return 'cat-lost';
      default: return 'cat-default';
    }
  };

  return (
    <motion.div
      className="community-card"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="post-header">
        <img src={avatar} alt={name} className="post-avatar" />
        <div className="post-meta">
          <div className="post-user-info">
            <h4 className="post-username">{name}</h4>
            <span className="post-time">{time}</span>
          </div>
          <span className={`post-category-badge ${getCategoryClass(category)}`}>
            {category}
          </span>
        </div>
      </div>

      <div className="post-body">
        <p className="post-description">{description}</p>
      </div>

      <div className="post-actions">
        <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          {isLiked ? <FaHeart className="action-icon liked-icon" /> : <FiHeart className="action-icon" />}
          <span>{likes} Likes</span>
        </button>

        <button className="action-btn">
          <FiMessageCircle className="action-icon" />
          <span>{commentsCount} Comments</span>
        </button>

        <button className="action-btn action-message-btn" onClick={onMessageClick}>
          <FiSend className="action-icon" />
          <span>Message</span>
        </button>
      </div>
    </motion.div>
  );
}

export default CommunityCard;
