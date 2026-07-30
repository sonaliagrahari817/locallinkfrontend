import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiBriefcase, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock, 
  FiDollarSign, 
  FiCheckCircle, 
  FiShield, 
  FiPlus, 
  FiTrash2, 
  FiArrowRight, 
  FiStar,
  FiZap,
  FiDroplet,
  FiScissors,
  FiWind,
  FiCode,
  FiBookOpen,
  FiTool,
  FiShoppingBag,
  FiPlusCircle,
  FiUpload
} from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/Button/Button';
import { saveNetworkWorker } from '../../data/dummyData';
import { workerAPI } from '../../utils/api';
import defaultAvatarImg from '../../assets/images/NoProfilePicture.png';
import heroBannerImg from '../../assets/images/hero_banner.jpg';
import './CreateProviderProfile.css';

const categoriesList = [
  { id: 'electrician', label: 'Electrician & Smart Home', icon: FiZap },
  { id: 'plumber', label: 'Plumbing & Leak Repair', icon: FiDroplet },
  { id: 'salon', label: 'Salon & Beauty at Home', icon: FiScissors },
  { id: 'cleaning', label: 'Home Deep Cleaning', icon: FiWind },
  { id: 'webdev', label: 'Web & Mobile App Development', icon: FiCode },
  { id: 'tutors', label: 'IIT/NEET & School Tutors', icon: FiBookOpen },
  { id: 'carpenter', label: 'Carpentry & Furniture', icon: FiTool },
  { id: 'grocery', label: 'Express Local Grocery', icon: FiShoppingBag },
  { id: 'pharmacy', label: 'Pharmacy & Medical 24/7', icon: FiPlusCircle }
];

function CreateProviderProfile() {
  const navigate = useNavigate();
  const providerFileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    category: 'electrician',
    city: 'Lucknow, UP',
    area: 'Alambagh Market',
    distance: '1.0 km',
    phone: '',
    email: '',
    experience: '5 Years',
    workingHours: '08:00 AM - 08:00 PM',
    pricePerHour: '₹399/hr',
    image: '',
    about: '',
    verified: true,
  });

  const [servicesList, setServicesList] = useState([
    { name: 'Standard Consultation & On-site Repair', price: '₹399' }
  ]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdProfile, setCreatedProfile] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleProviderFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice.trim()) return;
    setServicesList([
      ...servicesList,
      { name: newServiceName.trim(), price: newServicePrice.trim().startsWith('₹') ? newServicePrice.trim() : `₹${newServicePrice.trim()}` }
    ]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleRemoveService = (index) => {
    setServicesList(servicesList.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.profession.trim() || !formData.phone.trim()) {
      setError('Please fill in your name, profession, and contact number.');
      return;
    }

    setSubmitting(true);

    const newWorkerId = 'worker_' + Date.now();
    const newProviderObject = {
      id: newWorkerId,
      _id: newWorkerId,
      name: formData.name.trim(),
      profession: formData.profession.trim(),
      category: formData.category,
      rating: 5.0,
      reviewsCount: 1,
      distance: formData.distance || '1.0 km',
      city: formData.city || 'Bengaluru, KA',
      area: formData.area || 'Indiranagar',
      isOpen: true,
      verified: formData.verified,
      experience: formData.experience || '5 Years',
      workingHours: formData.workingHours || '08:00 AM - 08:00 PM',
      pricePerHour: formData.pricePerHour.startsWith('₹') ? formData.pricePerHour : `₹${formData.pricePerHour}`,
      phone: formData.phone.trim(),
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@localconnect.in`,
      image: formData.image.trim() || defaultAvatarImg,
      banner: heroBannerImg,
      about: formData.about.trim() || `${formData.name} is a verified ${formData.profession} based in ${formData.city}. Providing top quality service with 100% customer satisfaction.`,
      services: servicesList.length ? servicesList : [{ name: 'General Consultation', price: formData.pricePerHour }],
      ratingBreakdown: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [
        {
          id: 101,
          user: 'System Verification',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          rating: 5,
          date: 'Just now',
          comment: 'New local service provider verified on Local Link network.'
        }
      ]
    };

    try {
      await workerAPI.create(newProviderObject);
    } catch (err) {
      console.log('Backend offline – registering provider in local network storage');
    }

    // Save to global local connect network array
    saveNetworkWorker(newProviderObject);

    setSubmitting(false);
    setCreatedProfile(newProviderObject);
  };

  return (
    <div className="create-provider-page-wrapper">
      <Navbar />

      {/* Hidden file input for provider profile image */}
      <input 
        type="file" 
        ref={providerFileInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={handleProviderFileSelect} 
      />

      <main className="create-provider-main container">
        {/* Success Modal Overlay */}
        <AnimatePresence>
          {createdProfile && (
            <motion.div 
              className="provider-success-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="provider-success-modal glass"
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
              >
                <div className="success-badge-circle">
                  <FiCheckCircle className="badge-icon" />
                </div>
                
                <h2>Provider Profile Published!</h2>
                <p className="success-subtitle-text">
                  Congratulations <strong>{createdProfile.name}</strong>! Your profile for <strong>{createdProfile.profession}</strong> is now live on the Local Link network and visible to all nearby customers.
                </p>

                <div className="profile-preview-card glass">
                  <img src={createdProfile.image} alt={createdProfile.name} className="preview-avatar" />
                  <div className="preview-info">
                    <h4>{createdProfile.name}</h4>
                    <span className="preview-prof">{createdProfile.profession}</span>
                    <span className="preview-loc">📍 {createdProfile.area}, {createdProfile.city}</span>
                  </div>
                </div>

                <div className="modal-actions-row">
                  <Button 
                    variant="gradient" 
                    onClick={() => navigate(`/worker/${createdProfile.id}`)}
                    icon={FiUser}
                  >
                    View My Public Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/provider-dashboard')}
                    icon={FiArrowRight}
                  >
                    Go to Provider Console
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Header */}
        <section className="create-provider-hero text-center">
          <span className="provider-hero-badge">
            <FiShield className="badge-icon" /> Local Link Provider Network Registration
          </span>
          <h1>Join as a Local Service Provider</h1>
          <p>Create your verified profile to showcase your services, set transparent Rupee rates, and receive instant hiring bookings from local customers in your city.</p>
        </section>

        {/* Form Container */}
        <section className="provider-form-container glass">
          {error && (
            <div className="provider-error-banner">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal & Business Info */}
            <div className="form-section-block">
              <h3 className="section-block-title">
                <FiUser className="title-icon" /> 1. Personal & Profession Details
              </h3>
              
              <div className="fields-grid-2">
                <div className="form-group">
                  <label>Full Name / Business Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rajesh Sharma" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Profession / Service Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Master Electrician & Smart Home Automation" 
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Primary Category *</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Years of Experience</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 7 Years" 
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Contact & Location */}
            <div className="form-section-block mt-8">
              <h3 className="section-block-title">
                <FiMapPin className="title-icon" /> 2. Location & Contact Details
              </h3>
              
              <div className="fields-grid-2">
                <div className="form-group">
                  <label>City & State *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bengaluru, KA" 
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Area / Neighborhood *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Indiranagar" 
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +91 98765 43210" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. rajesh.sharma@gmail.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Pricing & Hours */}
            <div className="form-section-block mt-8">
              <h3 className="section-block-title">
                <FiClock className="title-icon" /> 3. Consultation Rates & Operating Hours
              </h3>
              
              <div className="fields-grid-2">
                <div className="form-group">
                  <label>Base Consultation Rate *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ₹399/hr" 
                    value={formData.pricePerHour}
                    onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Daily Working Hours</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 08:00 AM - 09:00 PM" 
                    value={formData.workingHours}
                    onChange={(e) => handleInputChange('workingHours', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Profile Picture & About */}
            <div className="form-section-block mt-8">
              <h3 className="section-block-title">
                <FiUser className="title-icon" /> 4. Profile Photo & Bio
              </h3>
              
              <div className="form-group">
                <label>Profile Photo (Choose file from local storage)</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={() => providerFileInputRef.current?.click()}
                    style={{
                      padding: '10px 16px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiUpload /> Choose Photo from Device
                  </button>
                  {formData.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={formData.image} alt="Preview" style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                      <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>Photo Loaded</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group mt-4">
                <label>About Your Service & Specialization</label>
                <textarea 
                  rows="4" 
                  placeholder="Describe your expertise, equipment, certifications, and service guarantees..."
                  value={formData.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                />
              </div>
            </div>

            {/* Step 5: Offered Services Builder */}
            <div className="form-section-block mt-8">
              <h3 className="section-block-title">
                <FiPlusCircle className="title-icon" /> 5. Offered Services & Rupee Rates
              </h3>
              <p className="section-desc-text">Add individual service packages with prices that customers can select and book directly on your profile.</p>

              <div className="services-builder-box glass">
                <div className="services-builder-inputs">
                  <input 
                    type="text" 
                    placeholder="Service Name (e.g. Switchboard Replacement)" 
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Price (e.g. ₹299)" 
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddService} icon={FiPlus}>
                    Add Service
                  </Button>
                </div>

                <div className="added-services-list">
                  {servicesList.map((svc, idx) => (
                    <div key={idx} className="added-service-chip">
                      <span className="svc-title">{svc.name}</span>
                      <span className="svc-price">{svc.price}</span>
                      <button type="button" className="btn-del-chip" onClick={() => handleRemoveService(idx)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 6: KYC Verification Checkbox */}
            <div className="form-section-block mt-8">
              <label className="kyc-checkbox-row">
                <input 
                  type="checkbox" 
                  checked={formData.verified}
                  onChange={(e) => handleInputChange('verified', e.target.checked)}
                />
                <span>I confirm that my Aadhaar / KYC details are valid and I agree to provide authentic local services.</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-submit-row mt-8">
              <Button type="submit" variant="gradient" size="lg" disabled={submitting} icon={FiCheckCircle}>
                {submitting ? 'Publishing Profile...' : 'Publish Local Provider Profile'}
              </Button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default CreateProviderProfile;
