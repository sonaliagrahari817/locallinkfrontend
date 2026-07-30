import React, { useState, useEffect, useRef } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiBell, 
  FiLogOut, 
  FiEdit3, 
  FiCheck, 
  FiImage, 
  FiRotateCcw, 
  FiUpload, 
  FiCamera,
  FiMessageSquare
} from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import defaultAvatarImg from '../../assets/images/NoProfilePicture.png';
import './Profile.css';

function Profile() {
  const { user: authUser, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  const [profile, setProfile] = useState({
    name: authUser?.name || 'Anshu Kumar',
    email: authUser?.email || 'anshu@gmail.com',
    phone: authUser?.phone || '+91 98765 12345',
    address: authUser?.address || 'House #45, Sector B, Alambagh, Lucknow, Uttar Pradesh 226005',
    city: authUser?.city || 'Lucknow, UP',
    role: authUser?.role || 'Customer',
    avatar: authUser?.avatar || defaultAvatarImg,
    notifications: authUser?.notifications || {
      emailAlerts: true,
      pushAlerts: true,
      smsAlerts: false,
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        if (res.data?.user) {
          setProfile(res.data.user);
          setFormData(res.data.user);
          updateUser(res.data.user);
        }
      } catch (err) {
        console.log('Using local auth profile');
      }
    };

    fetchProfile();
  }, []);

  // Update profile state if authUser changes
  useEffect(() => {
    if (authUser) {
      setProfile(prev => ({
        ...prev,
        avatar: authUser.avatar !== undefined ? authUser.avatar : prev.avatar
      }));
      setFormData(prev => ({
        ...prev,
        avatar: authUser.avatar !== undefined ? authUser.avatar : prev.avatar
      }));
    }
  }, [authUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationToggle = (key) => {
    const currentVal = profile.notifications?.[key] ?? true;
    const updatedNotifications = {
      ...profile.notifications,
      [key]: !currentVal
    };
    
    setProfile(prev => ({ ...prev, notifications: updatedNotifications }));
    setFormData(prev => ({ ...prev, notifications: updatedNotifications }));

    const updatedUserObj = { ...(authUser || profile), notifications: updatedNotifications };
    updateUser(updatedUserObj);

    userAPI.updateProfile({ notifications: updatedNotifications }).catch(() => {
      console.log('Saved notification preferences locally');
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Trigger local file browser
  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle local image file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF, etc.)');
      return;
    }

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      
      // Update form data and profile state
      setFormData(prev => ({ ...prev, avatar: base64Data }));
      setProfile(prev => ({ ...prev, avatar: base64Data }));
      
      // Sync immediately with AuthContext & localStorage
      const updatedUserObj = { ...(authUser || profile), avatar: base64Data };
      updateUser(updatedUserObj);

      // Save to backend if logged in with API
      userAPI.updateProfile({ avatar: base64Data }).catch(() => {
        console.log('Saved avatar locally');
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  // Remove/Reset Avatar to default image
  const handleResetAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: null }));
    setProfile(prev => ({ ...prev, avatar: null }));
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const updatedUserObj = { ...(authUser || profile), avatar: null };
    updateUser(updatedUserObj);

    userAPI.updateProfile({ avatar: null }).catch(() => {
      console.log('Reset avatar locally');
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(formData);
      if (res.data?.user) {
        setProfile(res.data.user);
        updateUser(res.data.user);
      } else {
        setProfile(formData);
        updateUser({ ...(authUser || {}), ...formData });
      }
    } catch (err) {
      setProfile(formData);
      updateUser({ ...(authUser || {}), ...formData });
    } finally {
      setSaving(false);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const currentAvatar = formData.avatar || profile.avatar || defaultAvatarImg;

  return (
    <div className="profile-page-wrapper">
      <Navbar />

      {/* Hidden file input for choosing image from local storage */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={handleFileSelect} 
      />

      <main className="profile-main container">
        <h1 className="profile-page-title">Account Settings</h1>
        <p className="profile-page-subtitle">Manage your personal settings, addresses, and profile picture.</p>

        {saveSuccess && (
          <div className="save-toast-banner slide-up">
            <FiCheck className="toast-icon" />
            <span>Profile picture & account settings updated successfully!</span>
          </div>
        )}

        <div className="profile-layout-grid">
          {/* Left panel: Avatar block */}
          <div className="profile-left-col glass">
            <div 
              className="profile-avatar-large-wrapper"
              onClick={handleTriggerFileInput}
              title="Click to choose profile picture from device"
            >
              <img 
                src={currentAvatar} 
                alt={profile.name} 
                className="profile-avatar-large" 
              />
              <button 
                type="button"
                className="avatar-edit-overlay-btn" 
                title="Choose Photo from Local Storage" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerFileInput();
                }}
              >
                <FiCamera />
              </button>
            </div>
            
            <h2 className="profile-user-name-title">{profile.name}</h2>
            <span className="profile-user-role-badge">{profile.role || 'user'} Account</span>

            {/* Quick avatar action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '12px', marginBottom: '20px' }}>
              <button 
                type="button"
                className="btn-upload-avatar"
                onClick={handleTriggerFileInput}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiUpload /> Choose Local Image
              </button>

              {(formData.avatar || profile.avatar) && (
                <button 
                  type="button"
                  className="btn-reset-avatar"
                  onClick={handleResetAvatar}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <FiRotateCcw /> Remove Photo
                </button>
              )}
            </div>

            <div className="profile-sidebar-actions">
              <button 
                type="button" 
                className="btn-chat-sidebar" 
                onClick={() => window.location.href = "/chat"}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 14px',
                  marginBottom: '10px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                <FiMessageSquare /> My Messages & Chat Inbox
              </button>
              {(authUser?.role === 'provider' || authUser?.role === 'admin') && (
                <button 
                  type="button" 
                  className="btn-provider-sidebar" 
                  onClick={() => window.location.href = "/provider-dashboard"}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 14px',
                    marginBottom: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Go to Provider Panel
                </button>
              )}
              <button type="button" className="btn-logout-sidebar" onClick={handleLogout}>
                <FiLogOut /> 
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right panel: Details fields form */}
          <div className="profile-right-col glass">
            <form onSubmit={handleSave}>
              <div className="profile-section-header">
                <h3>Personal Information</h3>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} icon={FiEdit3}>
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="form-fields-grid">
                <div className="profile-form-group">
                  <label><FiUser className="field-label-icon" /> Full Name</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.name || '' : profile.name || ''} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label><FiImage className="field-label-icon" /> Profile Picture</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      type="button"
                      onClick={handleTriggerFileInput}
                      style={{
                        padding: '9px 14px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <FiUpload /> Browse Local Files
                    </button>
                    {selectedFileName && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedFileName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="profile-form-group">
                  <label><FiMail className="field-label-icon" /> Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email || ''} 
                    disabled={true}
                  />
                </div>

                <div className="profile-form-group">
                  <label><FiPhone className="field-label-icon" /> Contact Number</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.phone || '' : profile.phone || ''} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="profile-form-group">
                  <label><FiMapPin className="field-label-icon" /> Address Location</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.address || '' : profile.address || ''} 
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
              </div>

              <div className="profile-section-header mt-5">
                <h3>Notifications Settings</h3>
              </div>

              <div className="notification-options-list">
                <div className="notification-option-row">
                  <div className="opt-meta">
                    <div className="opt-icon-box">
                      <FiBell className="opt-icon" />
                    </div>
                    <div>
                      <span className="opt-title">Email Notifications</span>
                      <span className="opt-desc">Receive booking invoices, reports, and tips via email.</span>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profile.notifications?.emailAlerts !== false}
                      onChange={() => handleNotificationToggle('emailAlerts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-option-row">
                  <div className="opt-meta">
                    <div className="opt-icon-box">
                      <FiBell className="opt-icon" />
                    </div>
                    <div>
                      <span className="opt-title">Push Alerts</span>
                      <span className="opt-desc">Receive real-time chat updates and status alerts in-app.</span>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profile.notifications?.pushAlerts !== false}
                      onChange={() => handleNotificationToggle('pushAlerts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {isEditing && (
                <div className="form-submit-actions">
                  <Button variant="ghost" onClick={() => { setIsEditing(false); setFormData({ ...profile }); }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
