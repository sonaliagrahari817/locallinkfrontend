import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FiMapPin, 
  FiCompass, 
  FiZap, 
  FiDroplet, 
  FiWind, 
  FiTool, 
  FiShoppingBag, 
  FiPlusCircle, 
  FiCheckCircle, 
  FiBriefcase
} from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import IndiaMap from '../../components/IndiaMap/IndiaMap';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import BookingTrackerModal from '../../components/BookingTrackerModal/BookingTrackerModal';
import { useAuth } from '../../context/AuthContext';
import { getNetworkServices, indianServicesCatalog, saveNetworkBooking } from '../../data/dummyData';
import { formatINR } from '../../data/formatters';
import { serviceAPI, bookingAPI } from '../../utils/api';
import './Services.css';

const filterCategories = [
  { id: 'all', name: 'All Nearby Services', icon: FiCompass },
  { id: 'electrician', name: 'Emergency Electrician', icon: FiZap },
  { id: 'plumber', name: 'Plumber & Leak Repair', icon: FiDroplet },
  { id: 'cleaning', name: 'AC & Home Deep Clean', icon: FiWind },
  { id: 'carpenter', name: 'Carpentry & Furniture', icon: FiTool },
  { id: 'grocery', name: 'Express Grocery (20m)', icon: FiShoppingBag },
  { id: 'pharmacy', name: 'Pharmacy & Medical 24/7', icon: FiPlusCircle }
];

function Services() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const searchParamQuery = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [maxDistance, setMaxDistance] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [servicesList, setServicesList] = useState(getNetworkServices());
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const servicesGridRef = useRef(null);

  // Auto-scroll to center on parameter load
  useEffect(() => {
    if (initialCat !== 'all' || searchParamQuery) {
      setTimeout(() => {
        if (servicesGridRef.current) {
          servicesGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  }, [initialCat, searchParamQuery]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const netSvcs = getNetworkServices();
      try {
        const res = await serviceAPI.getAll({ category: activeCategory !== 'all' ? activeCategory : undefined });
        if (res.data?.services) {
          const merged = [...res.data.services, ...netSvcs];
          const uniqueMap = new Map();
          merged.forEach(s => {
            const key = String(s._id || s.id);
            if (!uniqueMap.has(key)) uniqueMap.set(key, s);
          });
          setServicesList(Array.from(uniqueMap.values()));
        } else {
          setServicesList(netSvcs);
        }
      } catch (err) {
        setServicesList(netSvcs);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [activeCategory]);

  // Filter nearby local services by distance, search query & local category
  let filteredServices = servicesList;
  if (activeCategory !== 'all') {
    filteredServices = filteredServices.filter(s => s.category === activeCategory);
  }
  if (searchParamQuery.trim()) {
    const q = searchParamQuery.toLowerCase().trim();
    filteredServices = filteredServices.filter(s => 
      (s.title || s.name || '').toLowerCase().includes(q) ||
      (s.category || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      (s.providerName || s.provider?.name || '').toLowerCase().includes(q) ||
      (s.area || '').toLowerCase().includes(q)
    );
  }
  if (maxDistance === '1km') {
    filteredServices = filteredServices.filter(s => parseFloat(s.distance || '1.0') <= 1.2);
  } else if (maxDistance === '2km') {
    filteredServices = filteredServices.filter(s => parseFloat(s.distance || '1.0') <= 2.2);
  }

  const handleBookService = (svc) => {
    setSelectedService(svc);
    setBookingSuccess(false);
  };

  const closeBookingModal = () => setSelectedService(null);

  const { user } = useAuth();

  const [createdBookingObj, setCreatedBookingObj] = useState(null);
  const [showTrackerModal, setShowTrackerModal] = useState(false);

  const confirmBooking = async () => {
    const bkId = 'BK-IN' + Math.floor(1000 + Math.random() * 9000);
    const newBookingObj = {
      id: bkId,
      bookingId: bkId,
      customerName: user?.name || 'Anshu Kumar',
      customerEmail: user?.email || 'anshu@gmail.com',
      customerPhone: user?.phone || '+91 98765 12345',
      customer: {
        name: user?.name || 'Anshu Kumar',
        email: user?.email || 'anshu@gmail.com',
        phone: user?.phone || '+91 98765 12345',
        avatar: user?.avatar || null,
      },
      providerId: selectedService.providerId || selectedService.provider || selectedService.providerEmail || '1',
      providerName: selectedService.providerName || selectedService.name || 'Rajesh Sharma',
      providerEmail: selectedService.providerEmail || 'provider@localconnect.in',
      service: selectedService.title || selectedService.name,
      amount: selectedService.price || '₹349',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      status: 'Pending',
    };

    setCreatedBookingObj(newBookingObj);
    saveNetworkBooking(newBookingObj, user);

    try {
      await bookingAPI.create({
        service: selectedService.title || selectedService.name,
        amount: selectedService.price || '₹349',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
      });
    } catch (err) {
      console.log('Local booking fallback');
    }
    setBookingSuccess(true);
  };

  return (
    <div className="services-page-wrapper">
      <Navbar />

      <main className="services-main-content">
        {/* Services Hero Section */}
        <section className="services-hero-section">
          <div className="container text-center">
            <motion.span 
              className="services-badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiMapPin className="badge-icon" /> Live GPS Local Service Discovery
            </motion.span>
            
            <motion.h1 
              className="services-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Nearby Local Services Marketplace
            </motion.h1>

            <motion.p 
              className="services-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Discover verified local electricians, plumbers, AC technicians, home cleaning teams, carpenter experts, grocery delivery, and 24/7 medical services within your neighborhood.
            </motion.p>

            {/* Quick Distance Filter Pills */}
            <div className="distance-filter-pills">
              <span>Filter by Distance:</span>
              <button 
                className={`dist-pill ${maxDistance === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setMaxDistance('all');
                  if (servicesGridRef.current) servicesGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                All Distances
              </button>
              <button 
                className={`dist-pill ${maxDistance === '1km' ? 'active' : ''}`}
                onClick={() => {
                  setMaxDistance('1km');
                  if (servicesGridRef.current) servicesGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                &lt; 1.2 km (Instant Arrival)
              </button>
              <button 
                className={`dist-pill ${maxDistance === '2km' ? 'active' : ''}`}
                onClick={() => {
                  setMaxDistance('2km');
                  if (servicesGridRef.current) servicesGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                &lt; 2.2 km (Neighborhood)
              </button>
            </div>
          </div>
        </section>

        {/* Category Chips Bar */}
        <section className="container">
          <div className="services-chips-bar">
            {filterCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (servicesGridRef.current) servicesGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`service-cat-chip ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  <Icon className="chip-icon" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Nearby Local Services Grid */}
          <div className="nearby-services-section" ref={servicesGridRef}>
            <div className="section-header-row">
              <div>
                <h2>Active Nearby Local Services ({filteredServices.length})</h2>
                <p>Showing verified professionals in Alambagh, Singar Nagar & nearby Lucknow areas</p>
              </div>
              <span className="location-indicator">
                📍 Location: Alambagh, Lucknow
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Loader type="spinner" />
              </div>
            ) : (
              <div className="nearby-services-grid">
                <AnimatePresence>
                  {filteredServices.map((service) => (
                    <motion.div
                      key={service._id || service.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ServiceCard 
                        service={service} 
                        onBookClick={handleBookService} 
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Digital Services Spotlight for Enterprises */}
          <div className="digital-enterprise-section mt-12">
            <div className="block-header">
              <div className="flex items-center gap-2">
                <FiBriefcase className="header-icon text-indigo" />
                <div>
                  <h3>Digital & Software Services for Indian MSMEs</h3>
                  <p>Custom React Web Apps, Razorpay E-commerce Stores, & Mobile Apps</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/contact')}>
                Consult Architect
              </Button>
            </div>

            <div className="digital-catalog-grid">
              {indianServicesCatalog.slice(0, 3).map((item) => (
                <div key={item.id} className="digital-card glass">
                  <span className="card-cat-badge">{item.category}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <div className="digital-card-footer">
                    <Button variant="primary" size="sm" onClick={() => handleBookService({ title: item.title, price: item.price })}>
                      Inquire Quote
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Map Radar */}
          <div className="mt-12">
            <IndiaMap />
          </div>
        </section>

        {/* Instant Booking Dialog Modal Overlay */}
        <AnimatePresence>
          {selectedService && (
            <div className="modal-backdrop" onClick={closeBookingModal}>
              <motion.div 
                className="modal-box glass"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {bookingSuccess ? (
                  <div className="text-center py-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <FiCheckCircle style={{ fontSize: 52, color: '#10b981', margin: '0 auto' }} />
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Booking Request Confirmed!</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', margin: 0, maxWidth: '360px' }}>
                      Your request for <strong>{selectedService.title || selectedService.name}</strong> has been submitted.
                    </p>

                    <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '10px 14px', borderRadius: '12px', fontSize: '12.5px', fontWeight: 600, width: '100%', boxSizing: 'border-box' }}>
                      ✉️ Tax Invoice sent to <strong>{user?.email || 'your registered email'}</strong> & Bell Notifications updated.
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px', width: '100%' }}>
                      <Button 
                        variant="gradient" 
                        size="sm" 
                        style={{ flex: 1 }}
                        onClick={() => {
                          setShowTrackerModal(true);
                        }}
                      >
                        🚚 Track Order & Invoice
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={closeBookingModal}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="modal-header">
                      <FiCheckCircle className="modal-check-icon" />
                      <h3>Book Nearby Service</h3>
                    </div>
                    <p className="modal-service-name">
                      <strong>{selectedService.title || selectedService.name}</strong>
                      {selectedService.distance && <span className="modal-dist"> ({selectedService.distance})</span>}
                    </p>
                    <p className="modal-body">
                      Your booking request will be instantly dispatched to verified local service partners in <strong>{selectedService.area || 'your area'}</strong>. Pay transparent rates via UPI or Cash after service.
                    </p>
                    {selectedService.price && (
                      <div className="modal-price-summary">
                        <span>Estimated Rate:</span>
                        <strong>{formatINR(selectedService.price)}</strong>
                      </div>
                    )}
                    <div className="modal-actions">
                      <Button variant="gradient" onClick={confirmBooking}>
                        Confirm & Dispatch
                      </Button>
                      <Button variant="ghost" onClick={closeBookingModal}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {showTrackerModal && createdBookingObj && (
        <BookingTrackerModal 
          booking={createdBookingObj} 
          onClose={() => {
            setShowTrackerModal(false);
            closeBookingModal();
          }}
          onOpenChat={() => {
            setShowTrackerModal(false);
            closeBookingModal();
            navigate('/chat');
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default Services;
