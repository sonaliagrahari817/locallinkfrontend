import React from 'react';
import * as FiIcons from 'react-icons/fi';
import './DashboardCard.css';

function DashboardCard({ title, value, icon, change, isPositive = true }) {
  const IconComponent = FiIcons[icon] || FiIcons.FiTrendingUp;

  return (
    <div className="dashboard-card">
      <div className="db-card-content">
        <span className="db-card-title">{title}</span>
        <h3 className="db-card-value">{value}</h3>
        {change && (
          <span className={`db-card-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <div className="db-card-icon-wrapper">
        <IconComponent className="db-card-icon" />
      </div>
    </div>
  );
}

export default DashboardCard;
