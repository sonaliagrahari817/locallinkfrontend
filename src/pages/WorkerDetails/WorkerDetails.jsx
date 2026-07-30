import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiMessageSquare, FiCompass, FiShare2, FiCheck, FiClock, FiCalendar, FiX, FiShield, FiStar, FiSend, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Rating from '../../components/Rating/Rating';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import { getNetworkWorkers, saveNetworkBooking } from '../../data/dummyData';
import { formatPriceText } from '../../data/formatters';
import { workerAPI, bookingAPI, reviewAPI } from '../../utils/api';
import defaultAvatarImg from '../../assets/images/NoProfilePicture.png';
import './WorkerDetails.css';

function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookedSuccess, setBookedSuccess] = useState(false);

  // Reviews State
  const [myReview, setMyReview] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      setLoading(true);
      try {
        if (id && id !== 'undefined') {
          const res = await workerAPI.getById(id);
          if (res.data?.worker) {
            setWorker(res.data.worker);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.log('Worker API lookup error, checking local fallback data');
      }

      const netWorkers = getNetworkWorkers();
      // Robust fallback search for worker by ID, _id, category, or profession
      const found = netWorkers.find(w => 
        String(w._id) === String(id) || 
        String(w.id) === String(id)
      ) || netWorkers.find(w => 
        w.category && String(w.category).toLowerCase() === String(id).toLowerCase()
      ) || (
        String(id).toLowerCase().includes('web') || String(id).toLowerCase().includes('dev') 
          ? netWorkers.find(w => w.category === 'webdev') 
          : null
      ) || netWorkers[0];

      setWorker(found);
      setLoading(false);
    };

    fetchWorkerDetails();
  }, [id]);

  useEffect(() => {
    if (worker) {
      const workerKey = worker._id || worker.id || id;
      // Load saved user review from localStorage
      const savedReviewStr = localStorage.getItem(`user_review_${workerKey}`);
      let savedReview = null;
      if (savedReviewStr) {
        try {
          savedReview = JSON.parse(savedReviewStr);
          setMyReview(savedReview);
        } catch (e) {}
      }

      // Combine worker reviews with saved user review
      const initialReviews = worker.reviews || [];
      if (savedReview && !initialReviews.some(r => r.id === savedReview.id || r._id === savedReview._id)) {
        setReviewsList([savedReview, ...initialReviews]);
      } else {
        setReviewsList(initialReviews);
      }
    }
  }, [worker, id]);

  if (loading) {
    return (
      <div className="worker-details-page-wrapper">
        <Navbar />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader type="spinner" />
        </div>
        <Footer />
      </div>
    );
  }

  const {
    name,
    profession,
    rating,
    reviewsCount,
    distance,
    city,
    area,
    isOpen,
    verified,
    experience,
    workingHours,
    pricePerHour,
    image,
    banner,
    about,
    services = [],
    ratingBreakdown = { 5: 80, 4: 15, 3: 3, 2: 1, 1: 1 },
    reviews = []
  } = worker || {};

  const displayRate = formatPriceText(pricePerHour);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${name} - ${profession}`,
        text: `Check out ${name} on LocalConnect India!`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Profile link copied to clipboard!");
    }
  };

  const startBooking = (service) => {
    setSelectedService(service);
    setBookingModal(true);
    setBookedSuccess(false);
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      alert("Please select a date and time slot.");
      return;
    }

    const newBookingObj = {
      id: 'BK-IN' + Math.floor(1000 + Math.random() * 9000),
      bookingId: 'BK-IN' + Math.floor(1000 + Math.random() * 9000),
      customerName: user?.name || 'Anshu Kumar',
      customer: {
        name: user?.name || 'Anshu Kumar',
        email: user?.email || 'anshu@gmail.com',
        phone: user?.phone || '+91 98765 12345',
        avatar: user?.avatar || null,
      },
      worker: worker._id || worker.id,
      providerId: worker.user || worker.email || worker.id,
      providerEmail: worker.email,
      service: selectedService?.name || 'General Service',
      date: bookingDate,
      time: bookingTime,
      amount: selectedService?.price || displayRate,
      status: 'Pending',
    };

    saveNetworkBooking(newBookingObj, user);

    try {
      await bookingAPI.create({
        worker: worker._id || worker.id,
        service: selectedService?.name || 'General Service',
        date: bookingDate,
        time: bookingTime,
        amount: selectedService?.price || displayRate,
      });
    } catch (err) {
      console.log('Local booking fallback');
    }

    setBookedSuccess(true);
    setTimeout(() => {
      setBookingModal(false);
      navigate('/profile');
    }, 1600);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage("");

    const createdReview = {
      id: 'rev_' + Date.now(),
      user: user?.name || 'Anshu Kumar',
      avatar: user?.avatar || defaultAvatarImg,
      rating: newRating,
      date: 'Just now',
      comment: newComment.trim(),
      isMyReview: true,
    };

    try {
      await reviewAPI.create({
        workerId: worker._id || id,
        rating: newRating,
        comment: newComment,
      });
    } catch (err) {
      console.log('Local review state fallback');
    }

    const workerKey = worker?._id || id;
    localStorage.setItem(`user_review_${workerKey}`, JSON.stringify(createdReview));
    setMyReview(createdReview);
    setReviewsList(prev => [createdReview, ...prev.filter(r => !r.isMyReview && r.id !== createdReview.id)]);
    setReviewMessage("Your review has been submitted successfully!");
    setNewComment("");
    setSubmittingReview(false);
  };

  const handleDeleteMyReview = () => {
    const workerKey = worker?._id || id;
    localStorage.removeItem(`user_review_${workerKey}`);
    setMyReview(null);
    setReviewsList(prev => prev.filter(r => !r.isMyReview));
    setReviewMessage("");
  };

  return (
    <div className="worker-details-page-wrapper">
      <Navbar />

      <main className="worker-details-main">
        {/* Banner Area */}
        <section className="worker-banner-section" style={{ backgroundImage: `url(${banner || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80'})` }}>
          <div className="banner-overlay"></div>
        </section>

        {/* Profile Card Overlay */}
        <section className="container worker-profile-container">
          <div className="worker-profile-card glass">
            <div className="worker-profile-avatar-wrapper">
              <img src={image} alt={name} className="worker-profile-avatar" />
            </div>
            
            <div className="worker-profile-header-info">
              <div className="profile-badge-row">
                <span className={`status-badge ${isOpen ? 'status-open' : 'status-closed'}`}>
                  {isOpen ? 'Available Now' : 'Busy'}
                </span>
                {verified && (
                  <span className="profile-verified-badge">
                    <FiShield className="mr-1" /> Aadhaar & KYC Verified
                  </span>
                )}
                <span className="profile-exp-badge">{experience} Experience</span>
              </div>

              <h1 className="profile-worker-name">{name}</h1>
              <p className="profile-worker-profession">{profession}</p>

              <div className="profile-stats-row">
                <Rating value={rating} text={`${rating} (${reviewsCount} Reviews)`} />
                <span className="profile-stat-divider">|</span>
                <span className="profile-distance">{area ? `${area}, ${city}` : distance}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout Grid */}
        <section className="container worker-details-layout">
          <div className="worker-details-left-col">
            {/* Quick Actions Panel */}
            <div className="quick-actions-panel glass">
              <Button variant="primary" onClick={() => window.location.href = `tel:${worker.phone}`} icon={FiPhone}>
                Call {worker.phone || '+91 98765 43210'}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/chat?workerId=${encodeURIComponent(worker._id || worker.id || id)}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(worker.avatar || defaultAvatarImg)}`)} icon={FiMessageSquare}>
                Chat
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${worker.name}, ${area || ''}, ${city || 'Lucknow, UP'}`)}`, '_blank')} 
                icon={FiCompass}
                title="Open Google Maps Directions"
              >
                Directions
              </Button>
              <Button variant="ghost" onClick={handleShare} icon={FiShare2}>
                Share Profile
              </Button>
            </div>

            {/* About Block */}
            <div className="details-section-card">
              <h3>About Professional</h3>
              <p className="about-text">{about}</p>
            </div>

            {/* Services List */}
            <div className="details-section-card">
              <h3>Services & Rupee Pricing</h3>
              <div className="services-container">
                {services.map((svc, index) => (
                  <ServiceCard 
                    key={index} 
                    service={svc} 
                    onBookClick={startBooking} 
                  />
                ))}
              </div>
            </div>

            {/* Reviews list */}
            <div className="details-section-card">
              <h3>Customer Ratings & Reviews</h3>
              <div className="reviews-summary-block">
                <div className="overall-rating-box">
                  <span className="big-rating">{rating}</span>
                  <Rating value={rating} />
                  <span className="rating-subtitle">Based on {reviewsCount} verified reviews</span>
                </div>
                
                <div className="rating-bars-graph">
                  {Object.entries(ratingBreakdown).reverse().map(([star, count]) => {
                    const totalReviews = reviewsCount || 1;
                    const percent = Math.min(100, Math.round((count / totalReviews) * 100));
                    return (
                      <div key={star} className="rating-bar-row">
                        <span className="bar-star-label">{star} ★</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="bar-percentage-label">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="add-review-box glass mt-6" style={{ padding: '20px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                  {myReview ? 'Update Your Review' : 'Write a Verified Review'}
                </h4>
                {reviewMessage && (
                  <p style={{ color: '#10b981', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{reviewMessage}</p>
                )}
                <form onSubmit={handleReviewSubmit}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        style={{
                          fontSize: 20,
                          cursor: 'pointer',
                          color: star <= newRating ? '#f59e0b' : '#4b5563',
                          fill: star <= newRating ? '#f59e0b' : 'none',
                        }}
                        onClick={() => setNewRating(star)}
                      />
                    ))}
                  </div>
                  <textarea
                    rows="3"
                    placeholder="Share your service experience with this provider..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: 14,
                      marginBottom: 12,
                    }}
                    required
                  />
                  <Button type="submit" variant="gradient" size="sm" disabled={submittingReview} icon={FiSend}>
                    {submittingReview ? 'Submitting...' : myReview ? 'Update Review' : 'Post Review'}
                  </Button>
                </form>
              </div>

              {/* ── Dedicated Your Review Section ── */}
              {myReview && (
                <div className="my-review-section mt-6">
                  <div className="my-review-header-bar">
                    <div className="my-review-title">
                      <FiCheckCircle className="my-review-icon" />
                      <span>Your Published Review</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-delete-my-review"
                      onClick={handleDeleteMyReview}
                      title="Delete your review"
                    >
                      <FiTrash2 className="mr-1" /> Delete Review
                    </button>
                  </div>
                  
                  <div className="my-review-card-body glass">
                    <div className="review-header">
                      <img src={myReview.avatar} alt={myReview.user} className="review-avatar" />
                      <div className="review-user-info">
                        <h4 className="review-user-name">
                          {myReview.user} <span className="you-pill">You</span>
                        </h4>
                        <span className="review-date">{myReview.date}</span>
                      </div>
                      <Rating value={myReview.rating} className="review-stars" />
                    </div>
                    <p className="review-comment">"{myReview.comment}"</p>
                  </div>
                </div>
              )}

              {/* All Customer Reviews */}
              <div className="reviews-list mt-6">
                <h4 className="all-reviews-title">All Customer Reviews ({reviewsList.length})</h4>
                {reviewsList.map((rev, idx) => (
                  <ReviewCard key={rev._id || rev.id || idx} review={rev} />
                ))}
              </div>
            </div>
          </div>

          {/* Right column booking box (desktop sidebar) */}
          <div className="worker-details-right-col">
            <div className="booking-sidebar-card glass">
              <div className="sidebar-header">
                <h3>Book Appointment</h3>
                <p>Transparent UPI pricing. Pay after service completion.</p>
              </div>

              <div className="sidebar-detail-item">
                <FiClock className="sidebar-icon" />
                <div>
                  <span className="item-label">Working Hours</span>
                  <span className="item-value">{workingHours}</span>
                </div>
              </div>

              <div className="sidebar-detail-item">
                <FiCalendar className="sidebar-icon" />
                <div>
                  <span className="item-label">Consultation Rate</span>
                  <span className="item-value">{displayRate} Base Rate</span>
                </div>
              </div>

              <Button variant="gradient" size="lg" className="w-100 mt-4" onClick={() => startBooking({ name: 'General Consultation', price: displayRate })}>
                Book Professional
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Booking Dialog Modal Overlay */}
      <AnimatePresence>
        {bookingModal && (
          <div className="booking-modal-overlay">
            <motion.div 
              className="booking-modal-box glass"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button className="close-modal-btn" onClick={() => setBookingModal(false)}>
                <FiX />
              </button>

              {bookedSuccess ? (
                <div className="booking-success-message">
                  <div className="success-icon-badge">
                    <FiCheck />
                  </div>
                  <h3>Booking Confirmed!</h3>
                  <p>Your appointment for <strong>{selectedService?.name}</strong> has been sent to {name}. Pay via UPI or Cash after service.</p>
                </div>
              ) : (
                <form className="booking-form" onSubmit={confirmBooking}>
                  <h3>Schedule Booking</h3>
                  <p className="form-service-name">Service: {selectedService?.name} ({selectedService?.price})</p>

                  <div className="form-group">
                    <label>Select Service Date</label>
                    <input 
                      type="date" 
                      required 
                      value={bookingDate} 
                      onChange={(e) => setBookingDate(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Select Time Slot</label>
                    <input 
                      type="time" 
                      required 
                      value={bookingTime} 
                      onChange={(e) => setBookingTime(e.target.value)} 
                    />
                  </div>

                  <Button type="submit" variant="gradient" size="md" className="w-100 mt-4">
                    Confirm Appointment
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default WorkerDetails;
