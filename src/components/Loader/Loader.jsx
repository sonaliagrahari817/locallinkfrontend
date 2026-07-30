import React from 'react';
import './Loader.css';

function Loader({ type = 'spinner', width = '100%', height = '20px', borderRadius = '4px', className = '' }) {
  if (type === 'skeleton') {
    return (
      <div
        className={`shimmer-bg loader-skeleton ${className}`}
        style={{ width, height, borderRadius }}
      />
    );
  }

  return (
    <div className={`loader-spinner-container ${className}`}>
      <div className="loader-spinner"></div>
    </div>
  );
}

export default Loader;
