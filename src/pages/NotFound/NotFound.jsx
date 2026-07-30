import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiCompass } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page-wrapper">
      <div className="notfound-card glass fade-in">
        <div className="notfound-icon-box">
          <FiCompass className="notfound-icon" />
        </div>
        <h1 className="notfound-code">404</h1>
        <h2>Lost in Neighborhood?</h2>
        <p>The page you are looking for does not exist or has been relocated to another street.</p>
        <Button variant="gradient" size="md" onClick={() => navigate('/')} icon={FiHome}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
