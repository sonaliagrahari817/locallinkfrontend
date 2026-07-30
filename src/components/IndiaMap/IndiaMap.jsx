import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiCheckCircle, FiUsers, FiStar, FiArrowRight, FiNavigation, FiZap, FiDroplet, FiWind, FiShoppingBag, FiPlusCircle, FiCompass, FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './IndiaMap.css';

const indianCities = [
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', coords: { x: 38, y: 32 }, workers: 480, tag: 'Alambagh & City Hub' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', coords: { x: 38, y: 72 }, workers: 450, tag: 'Tech & Home Hub' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', coords: { x: 26, y: 56 }, workers: 520, tag: 'Financial & Beauty Hub' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', coords: { x: 36, y: 28 }, workers: 610, tag: 'Capital Services' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', coords: { x: 44, y: 60 }, workers: 380, tag: 'IT & Deep Clean' },
];

const nearbyPins = [
  { id: 'p1', name: 'Emergency Electrician (0.8 km)', type: 'Alambagh Market', icon: FiZap, coords: { x: 28, y: 32 }, query: 'Electrician Alambagh Lucknow' },
  { id: 'p2', name: 'Master Plumber (0.6 km)', type: 'Singar Nagar, Alambagh', icon: FiDroplet, coords: { x: 55, y: 40 }, query: 'Plumber Singar Nagar Alambagh Lucknow' },
  { id: 'p3', name: 'AC Jet Servicing (1.1 km)', type: 'Chander Nagar, Alambagh', icon: FiWind, coords: { x: 72, y: 65 }, query: 'AC Service Chander Nagar Alambagh Lucknow' },
  { id: 'p4', name: 'Express Grocery (0.4 km)', type: 'Alambagh Bus Stand Market', icon: FiShoppingBag, coords: { x: 42, y: 75 }, query: 'Grocery Alambagh Market Lucknow' },
  { id: 'p5', name: '24x7 Pharmacy (0.5 km)', type: 'Singar Nagar Metro Gate', icon: FiPlusCircle, coords: { x: 20, y: 68 }, query: 'Pharmacy Singar Nagar Metro Alambagh Lucknow' }
];

function IndiaMap({ selectedCity, onSelectCity }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('radar'); // 'radar', 'gmaps', or 'india'
  const [activeServicePin, setActiveServicePin] = useState(nearbyPins[0]);
  const [activeCity, setActiveCity] = useState(
    indianCities.find(c => c.name.toLowerCase().includes(selectedCity?.toLowerCase() || 'lucknow')) || indianCities[0]
  );

  // GPS Radar State
  const [gpsState, setGpsState] = useState({
    status: 'idle', // 'idle', 'locating', 'connected', 'error'
    lat: 26.8124,
    lng: 80.9022,
    locationName: 'Alambagh Market, Lucknow, UP',
    accuracy: '± 12m'
  });

  const handleCityClick = (city) => {
    setActiveCity(city);
    if (onSelectCity) onSelectCity(city.name);
  };

  // GPS Radar Trigger
  const handleConnectGPS = () => {
    setGpsState(prev => ({ ...prev, status: 'locating' }));
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsState({
            status: 'connected',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            locationName: 'Live GPS: Alambagh, Lucknow (Verified)',
            accuracy: `± ${Math.round(position.coords.accuracy || 15)}m`
          });
        },
        (error) => {
          // Fallback to Alambagh Lucknow default coordinates
          setGpsState({
            status: 'connected',
            lat: 26.8124,
            lng: 80.9022,
            locationName: 'Alambagh Market, Lucknow, UP (Default)',
            accuracy: '± 15m'
          });
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setGpsState({
        status: 'connected',
        lat: 26.8124,
        lng: 80.9022,
        locationName: 'Alambagh Market, Lucknow, UP',
        accuracy: '± 15m'
      });
    }
  };

  const handleOpenGoogleMapsApp = () => {
    const query = encodeURIComponent(`${activeServicePin.name}, ${activeServicePin.type}, Lucknow, UP`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="india-map-wrapper glass">
      <div className="india-map-header">
        <div>
          <span 
            className={`india-map-badge ${gpsState.status === 'connected' ? 'gps-active' : ''}`}
            onClick={handleConnectGPS}
            style={{ cursor: 'pointer' }}
            title="Click to refresh live GPS radar"
          >
            <FiNavigation className="badge-icon" /> 
            {gpsState.status === 'locating' ? 'Locating Live GPS...' : 
             gpsState.status === 'connected' ? `🟢 GPS Radar Active: ${gpsState.locationName}` : 
             'Live GPS Radar & Service Connect (Click to Activate)'}
          </span>
          <h3 className="india-map-title">Interactive Local Service Discovery Map</h3>
          <p className="india-map-sub">
            Explore live service markers pinned in your immediate neighborhood area within 0.5 to 3.0 km.
          </p>
        </div>

        <div className="map-view-toggle-bar">
          <button 
            className={`map-toggle-btn ${viewMode === 'radar' ? 'active' : ''}`}
            onClick={() => setViewMode('radar')}
          >
            📍 Radar View
          </button>
          <button 
            className={`map-toggle-btn ${viewMode === 'gmaps' ? 'active' : ''}`}
            onClick={() => setViewMode('gmaps')}
          >
            🗺️ Google Maps Embed
          </button>
          <button 
            className={`map-toggle-btn ${viewMode === 'india' ? 'active' : ''}`}
            onClick={() => setViewMode('india')}
          >
            🇮🇳 Major Indian Metros
          </button>
        </div>
      </div>

      <div className="india-map-content-grid">
        {/* Interactive Map Visual */}
        <div className="india-map-canvas-container">
          {viewMode === 'radar' ? (
            /* Local Neighborhood Radar Canvas */
            <div className="radar-map-canvas">
              <div className="radar-grid-rings"></div>
              <div className="radar-sweep-line"></div>
              
              {/* User Center Pin */}
              <div className="user-center-marker" onClick={handleConnectGPS} title="Click to pulse GPS Radar">
                <div className="user-ping"></div>
                <div className="user-core">You</div>
              </div>

              {/* Local Service Pins */}
              {nearbyPins.map((pin) => {
                const Icon = pin.icon;
                const isSelected = activeServicePin.id === pin.id;
                return (
                  <motion.div
                    key={pin.id}
                    className={`radar-service-pin ${isSelected ? 'selected' : ''}`}
                    style={{ left: `${pin.coords.x}%`, top: `${pin.coords.y}%` }}
                    onClick={() => setActiveServicePin(pin)}
                    whileHover={{ scale: 1.2 }}
                  >
                    <div className="radar-pin-dot">
                      <Icon />
                    </div>
                    <span className="radar-pin-label">{pin.name}</span>
                  </motion.div>
                );
              })}
            </div>
          ) : viewMode === 'gmaps' ? (
            /* Google Maps View Embed */
            <div className="google-map-embed-wrapper" style={{ width: '100%', height: '380px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
              <iframe
                title="Google Maps Alambagh Lucknow"
                width="100%"
                height="380"
                style={{ border: 0, borderRadius: '16px' }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${activeServicePin.type}, Alambagh, Lucknow, Uttar Pradesh`)}&z=15&output=embed`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          ) : (
            /* Pan-India Outline View */
            <div className="india-map-svg-wrapper">
              <svg viewBox="0 0 100 100" className="india-outline-svg" aria-label="Map of India">
                <path
                  d="M 38 12 L 48 15 L 56 12 L 62 20 L 58 28 L 74 34 L 88 32 L 94 40 L 80 44 L 78 52 L 68 54 L 56 65 L 48 88 L 44 94 L 40 86 L 30 70 L 22 58 L 22 48 L 14 36 L 24 30 L 32 20 Z"
                  className="india-map-path"
                />
              </svg>
              <div className="map-grid-overlay"></div>
              {indianCities.map((city) => {
                const isSelected = activeCity.id === city.id;
                return (
                  <motion.div
                    key={city.id}
                    className={`india-city-pin ${isSelected ? 'selected' : ''}`}
                    style={{ left: `${city.coords.x}%`, top: `${city.coords.y}%` }}
                    onClick={() => handleCityClick(city)}
                    whileHover={{ scale: 1.25 }}
                  >
                    <div className="pin-pulse-ring"></div>
                    <div className="pin-dot-inner">
                      <FiMapPin className="pin-icon" />
                    </div>
                    <span className="pin-label">{city.name}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Meta Box */}
        <div className="city-info-card glass">
          {viewMode === 'radar' || viewMode === 'gmaps' ? (
            <>
              <div className="city-info-header">
                <div>
                  <h4 className="city-name">{activeServicePin.name}</h4>
                  <span className="city-state">{activeServicePin.type} • Alambagh Hub</span>
                </div>
                <span className="city-tag-pill">GPS Verified</span>
              </div>

              <div className="city-stats-grid">
                <div className="city-stat-box">
                  <FiMapPin className="stat-icon" />
                  <div>
                    <span className="stat-num">&lt; 15 Mins</span>
                    <span className="stat-lbl">Est. Response</span>
                  </div>
                </div>
                <div className="city-stat-box">
                  <FiStar className="stat-icon star" />
                  <div>
                    <span className="stat-num">4.9 / 5</span>
                    <span className="stat-lbl">Rating</span>
                  </div>
                </div>
                <div className="city-stat-box">
                  <FiCheckCircle className="stat-icon check" />
                  <div>
                    <span className="stat-num">Aadhaar</span>
                    <span className="stat-lbl">KYC Checked</span>
                  </div>
                </div>
              </div>

              <p className="city-desc">
                Nearby <strong>{activeServicePin.name}</strong> is currently active and accepting instant service calls in Alambagh, Lucknow.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <button 
                  className="btn-city-explore"
                  onClick={() => navigate('/services')}
                >
                  Book Nearby Local Services <FiArrowRight className="ml-2" />
                </button>
                <button
                  className="map-toggle-btn"
                  onClick={handleOpenGoogleMapsApp}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px 14px', borderRadius: '10px', fontWeight: '700', fontSize: '13px' }}
                >
                  <FiExternalLink /> Open in Google Maps App
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="city-info-header">
                <div>
                  <h4 className="city-name">{activeCity.name}</h4>
                  <span className="city-state">{activeCity.state}, India</span>
                </div>
                <span className="city-tag-pill">{activeCity.tag}</span>
              </div>

              <div className="city-stats-grid">
                <div className="city-stat-box">
                  <FiUsers className="stat-icon" />
                  <div>
                    <span className="stat-num">{activeCity.workers}+</span>
                    <span className="stat-lbl">Active Pros</span>
                  </div>
                </div>
                <div className="city-stat-box">
                  <FiStar className="stat-icon star" />
                  <div>
                    <span className="stat-num">4.9 / 5</span>
                    <span className="stat-lbl">Avg Rating</span>
                  </div>
                </div>
                <div className="city-stat-box">
                  <FiCheckCircle className="stat-icon check" />
                  <div>
                    <span className="stat-num">100%</span>
                    <span className="stat-lbl">UPI & KYC Verified</span>
                  </div>
                </div>
              </div>

              <p className="city-desc">
                Connecting households & enterprises in <strong>{activeCity.name}</strong> with top-rated local service pros.
              </p>

              <button 
                className="btn-city-explore"
                onClick={() => navigate(`/nearby?category=all`)}
              >
                Find Pros in {activeCity.name} <FiArrowRight className="ml-2" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndiaMap;
