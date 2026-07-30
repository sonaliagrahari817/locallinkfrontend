import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiMapPin, 
  FiUsers, 
  FiPercent, 
  FiUser, 
  FiBell, 
  FiMenu, 
  FiX, 
  FiBriefcase, 
  FiInfo, 
  FiPhoneCall, 
  FiLogIn, 
  FiLogOut, 
  FiMessageSquare,
  FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { 
  locationsList, 
  getCustomerNotifications,
  markCustomerNotificationRead,
  markAllCustomerNotificationsRead 
} from '../../data/dummyData';
import logoImg from '../../assets/images/LocalLinkLogo.png';
import defaultAvatarImg from '../../assets/images/NoProfilePicture.png';
import BookingTrackerModal from '../BookingTrackerModal/BookingTrackerModal';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Lucknow, UP");
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTrackerBooking, setActiveTrackerBooking] = useState(null);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => {
    setIsOpen(false);
    setShowUserMenu(false);
    setShowNotifMenu(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  useEffect(() => {
    if (user && user.role === 'user') {
      const loaded = getCustomerNotifications(user);
      setNotifications(loaded);
    } else {
      setNotifications([]);
    }
  }, [user, showNotifMenu]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    markCustomerNotificationRead(user, notif.id);
    setNotifications(prev => prev.map(n => String(n.id) === String(notif.id) ? { ...n, read: true } : n));
    setShowNotifMenu(false);

    if (notif.booking) {
      setActiveTrackerBooking(notif.booking);
    } else if (notif.bookingId) {
      setActiveTrackerBooking({ bookingId: notif.bookingId, service: notif.title, amount: '₹399' });
    }
  };

  const handleMarkAllRead = () => {
    markAllCustomerNotificationsRead(user);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      {/* Top Header Navbar */}
      <header className="navbar-header glass">
        <div className="navbar-container container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMenu} title="LocalLink India">
            <img src={logoImg} alt="LocalLink Logo" className="navbar-logo-image" />
          </Link>

          {/* Location Selector */}
          <div className="navbar-location">
            <FiMapPin className="nav-pin-icon" />
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              {locationsList.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Nav Links */}
          <nav className="navbar-nav-desktop">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              <FiHome /> Home
            </NavLink>
            <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              <FiBriefcase /> Services
            </NavLink>
            <NavLink to="/nearby" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              <FiMapPin /> Nearby Pros
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu} title="Direct Messages & Chat">
                <FiMessageSquare /> Chat
              </NavLink>
            )}
            <NavLink to="/offers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              <FiPercent /> Offers
            </NavLink>
            <NavLink to="/community" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
              <FiUsers /> Forum
            </NavLink>

            {(user?.role === 'provider' || user?.role === 'admin') && (
              <NavLink to="/provider-dashboard" className={({ isActive }) => `nav-link nav-provider-highlight ${isActive ? 'active' : ''}`} onClick={closeMenu} title="Service Provider Panel">
                <FiBriefcase /> Provider Panel
              </NavLink>
            )}
          </nav>

          {/* Right Actions */}
          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                {/* Bell Notifications */}
                <div ref={notifMenuRef} style={{ position: 'relative' }}>
                  <button 
                    className="nav-action-btn notification-btn" 
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowUserMenu(false);
                    }}
                    title="Booking Notifications"
                  >
                    <FiBell />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                  </button>

                  {showNotifMenu && (
                    <div className="notifications-dropdown-menu glass">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiBell style={{ color: 'var(--primary)' }} /> Notifications ({unreadCount} new)
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {unreadCount > 0 && (
                            <button 
                              type="button" 
                              onClick={handleMarkAllRead}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                            >
                              Mark all read
                            </button>
                          )}
                          <button onClick={() => setShowNotifMenu(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}><FiX /></button>
                        </div>
                      </div>

                      {notifications.length === 0 ? (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                          No booking status updates yet.
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <div 
                            key={n.id || i} 
                            onClick={() => handleNotificationClick(n)}
                            style={{ 
                              padding: '10px 12px', 
                              borderRadius: '12px',
                              marginBottom: '6px',
                              background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.12)', 
                              border: n.read ? '1px solid transparent' : '1px solid rgba(99, 102, 241, 0.25)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="Click to track booking live & view email invoice"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{n.title}</div>
                              {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-main)', margin: '4px 0', lineHeight: 1.4 }}>{n.message}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{n.timestamp || n.date || 'Just now'} {n.read && '• Read'}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Profile User Dropdown */}
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button 
                    type="button"
                    className="nav-profile-btn"
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifMenu(false);
                    }}
                    title="User Profile Menu"
                  >
                    <img src={user?.avatar || defaultAvatarImg} alt="Profile" className="nav-profile-img" />
                    <FiChevronDown className="chevron-icon" />
                  </button>

                  {showUserMenu && (
                    <div className="user-dropdown-card glass">
                      <div className="user-dropdown-header">
                        <img src={user?.avatar || defaultAvatarImg} alt={user?.name} className="dropdown-user-avatar" />
                        <div className="dropdown-user-meta">
                          <strong>{user?.name || 'User'}</strong>
                          <span>{user?.email}</span>
                          <span className="role-tag">{user?.role === 'provider' ? 'Service Provider' : 'Customer'}</span>
                        </div>
                      </div>

                      <div className="user-dropdown-divider" />

                      <div className="user-dropdown-links">
                        <button onClick={() => { navigate('/profile'); closeMenu(); }}>
                          <FiUser /> Account Settings
                        </button>

                        <button onClick={() => { navigate('/chat'); closeMenu(); }}>
                          <FiMessageSquare /> My Messages & Chat
                        </button>

                        {(user?.role === 'provider' || user?.role === 'admin') && (
                          <button onClick={() => { navigate('/provider-dashboard'); closeMenu(); }} className="highlight">
                            <FiBriefcase /> Provider Console
                          </button>
                        )}

                        <div className="user-dropdown-divider" />

                        <button onClick={handleLogout} className="logout-btn">
                          <FiLogOut /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="nav-login-btn" title="Sign In" onClick={closeMenu}>
                <FiLogIn />
                <span>Sign In</span>
              </Link>
            )}

            <button className="nav-action-btn hamburger-menu" onClick={toggleMenu} title="Toggle Menu">
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Live Booking Tracker Modal */}
      {activeTrackerBooking && (
        <BookingTrackerModal 
          booking={activeTrackerBooking} 
          onClose={() => setActiveTrackerBooking(null)}
          onOpenChat={() => {
            setActiveTrackerBooking(null);
            navigate('/chat');
          }}
        />
      )}

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu} />
      )}

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="mobile-drawer active glass">
          <nav className="mobile-drawer-nav">
            <NavLink to="/" className="drawer-link" onClick={closeMenu}>
              <FiHome /> Home
            </NavLink>
            <NavLink to="/services" className="drawer-link" onClick={closeMenu}>
              <FiBriefcase /> All Services
            </NavLink>
            <NavLink to="/about" className="drawer-link" onClick={closeMenu}>
              <FiInfo /> About Us
            </NavLink>
            <NavLink to="/nearby" className="drawer-link" onClick={closeMenu}>
              <FiMapPin /> Nearby Workers
            </NavLink>
            <NavLink to="/contact" className="drawer-link" onClick={closeMenu}>
              <FiPhoneCall /> Contact Us
            </NavLink>

            {(user?.role === 'provider' || user?.role === 'admin') && (
              <NavLink to="/provider-dashboard" className="drawer-link drawer-provider-highlight" onClick={closeMenu}>
                <FiBriefcase /> Service Provider Console
              </NavLink>
            )}

            {isAuthenticated ? (
              <>
                <NavLink to="/chat" className="drawer-link" onClick={closeMenu}>
                  <FiMessageSquare /> Messages & Direct Chat
                </NavLink>
                <button className="drawer-link" onClick={() => { navigate('/profile'); closeMenu(); }}>
                  <FiUser /> Profile & Account Settings
                </button>
                <button className="drawer-link btn-logout" onClick={handleLogout}>
                  <FiLogOut /> Sign Out ({user?.name})
                </button>
              </>
            ) : (
              <Link to="/login" className="drawer-link btn-login" onClick={closeMenu}>
                <FiLogIn /> Customer & Provider Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

export default Navbar;
