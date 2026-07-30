import React from 'react';
import * as FiIcons from 'react-icons/fi';
import { motion } from 'framer-motion';
import './CategoryCard.css';

function CategoryCard({ category, onClick }) {
  const { name, icon, color } = category;
  
  // Resolve icon component dynamically
  const IconComponent = FiIcons[icon] || FiIcons.FiGrid;

  return (
    <motion.div
      onClick={onClick}
      className="category-card"
      whileHover={{ y: -5, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="category-icon-wrapper" style={{ background: color }}>
        <IconComponent className="category-icon" />
      </div>
      <span className="category-name">{name}</span>
    </motion.div>
  );
}

export default CategoryCard;
