import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-hover)' }}
      whileTap={{ scale: 0.97 }}
      className={`btn btn-${variant} btn-${size} ${className}`}
    >
      {Icon && <span className="btn-icon"><Icon /></span>}
      {children}
    </motion.button>
  );
}

export default Button;
