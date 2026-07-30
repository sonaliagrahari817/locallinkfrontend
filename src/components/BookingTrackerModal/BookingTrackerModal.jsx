import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiCheckCircle, 
  FiClock, 
  FiTruck, 
  FiPhone, 
  FiMessageSquare, 
  FiMail, 
  FiFileText, 
  FiMapPin, 
  FiShield, 
  FiAlertCircle
} from 'react-icons/fi';
import Button from '../Button/Button';
import './BookingTrackerModal.css';

function BookingTrackerModal({ booking, onClose, onOpenChat }) {
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' | 'invoice'
  const [isCancelled, setIsCancelled] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(booking?.status || 'Pending');

  React.useEffect(() => {
    if (!booking) return;
    const checkStatus = () => {
      const custom = localStorage.getItem('localconnect_network_bookings');
      if (custom) {
        try {
          const list = JSON.parse(custom);
          const found = list.find(b => String(b.bookingId || b.id || b._id) === String(booking.bookingId || booking.id || booking._id));
          if (found && found.status) {
            setBookingStatus(found.status);
          }
        } catch (e) {}
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 1500);
    return () => clearInterval(interval);
  }, [booking]);

  if (!booking) return null;

  const handleCancelBooking = () => {
    if (window.confirm("Are you sure you want to cancel this booking request?")) {
      setIsCancelled(true);
    }
  };

  const bookingId = booking.bookingId || booking.id || 'BK-IN8942';
  const serviceName = booking.service || 'Local Home Service';
  const amount = booking.amount || '₹399';
  const date = booking.date || new Date().toISOString().split('T')[0];
  const time = booking.time || '10:00 AM';
  const providerName = booking.providerName || booking.workerName || 'Rajesh Sharma (Verified Partner)';
  const customerName = booking.customerName || booking.customer?.name || 'Anshu Kumar';
  const customerEmail = booking.customerEmail || booking.customer?.email || 'anshu@gmail.com';
  const customerPhone = booking.customerPhone || booking.customer?.phone || '+91 98765 12345';

  return (
    <AnimatePresence>
      <div className="tracker-modal-overlay" onClick={onClose}>
        <motion.div 
          className="tracker-modal-card glass"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="tracker-modal-header">
            <div className="tracker-header-left">
              <span className="tracker-badge">Live Order Tracker</span>
              <h2>Booking #{bookingId}</h2>
            </div>
            <button className="btn-close-tracker" onClick={onClose} title="Close Tracker">
              <FiX />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="tracker-tabs-bar">
            <button 
              className={`tracker-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracker')}
            >
              <FiTruck /> Live Tracking & Status
            </button>
            <button 
              className={`tracker-tab-btn ${activeTab === 'invoice' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoice')}
            >
              <FiFileText /> Email Invoice & Receipt
            </button>
          </div>

          {/* Content Body */}
          <div className="tracker-modal-body">
            {activeTab === 'tracker' ? (
              <div className="tracker-tab-content">
                {/* Status Timeline */}
                <div className="status-timeline-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="timeline-title" style={{ margin: 0 }}>Service Status Pipeline</h3>
                    <span className="current-status-tag" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.15)', padding: '3px 10px', borderRadius: '99px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                      Status: {bookingStatus}
                    </span>
                  </div>
                  
                  {isCancelled || bookingStatus === 'Cancelled' ? (
                    <div className="cancelled-banner">
                      <FiAlertCircle className="cancel-icon" />
                      <span>This booking has been cancelled as requested. Refund/adjustment processed.</span>
                    </div>
                  ) : (
                    <div className="pipeline-steps">
                      <div className="step-item completed">
                        <div className="step-node">
                          <FiCheckCircle />
                        </div>
                        <div className="step-info">
                          <h4>Booking Requested</h4>
                          <p>Received on {date} at {time}</p>
                        </div>
                      </div>

                      <div className={`step-item ${['Confirmed', 'Accepted', 'En Route', 'Completed'].includes(bookingStatus) ? 'completed' : 'active'}`}>
                        <div className={`step-node ${['Confirmed', 'Accepted', 'En Route', 'Completed'].includes(bookingStatus) ? '' : 'pulsing'}`}>
                          <FiClock />
                        </div>
                        <div className="step-info">
                          <h4>Provider Confirmed Slot</h4>
                          <p>{['Confirmed', 'Accepted', 'En Route', 'Completed'].includes(bookingStatus) ? `${providerName} confirmed your appointment` : `${providerName} is reviewing job requirements`}</p>
                        </div>
                      </div>

                      <div className={`step-item ${bookingStatus === 'Completed' ? 'completed' : (bookingStatus === 'En Route' ? 'active' : 'pending')}`}>
                        <div className={`step-node ${bookingStatus === 'En Route' ? 'pulsing' : ''}`}>
                          <FiTruck />
                        </div>
                        <div className="step-info">
                          <h4>Partner En Route</h4>
                          <p>{bookingStatus === 'En Route' ? `Live GPS navigation active (Est. 12 mins arrival)` : `Dispatched upon partner departure`}</p>
                        </div>
                      </div>

                      <div className={`step-item ${bookingStatus === 'Completed' ? 'completed' : 'pending'}`}>
                        <div className="step-node">
                          <FiCheckCircle />
                        </div>
                        <div className="step-info">
                          <h4>Service Completion & Payment</h4>
                          <p>{bookingStatus === 'Completed' ? `Service finished cleanly & invoice signed` : `Digital invoice sign-off upon completion`}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Details Card */}
                <div className="details-summary-card">
                  <div className="detail-row">
                    <span className="label">Service Name:</span>
                    <span className="val highlight">{serviceName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Assigned Partner:</span>
                    <span className="val">{providerName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Amount:</span>
                    <span className="val price">{amount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Scheduled Time:</span>
                    <span className="val">{date} at {time}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Service Location:</span>
                    <span className="val"><FiMapPin className="pin-icon" /> Alambagh Market, Lucknow</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="tracker-actions-bar">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    icon={FiPhone}
                    onClick={() => window.location.href = "tel:+919876543210"}
                  >
                    Call Partner
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={FiMessageSquare}
                    onClick={() => {
                      onClose();
                      if (onOpenChat) onOpenChat();
                      else window.location.href = "/chat";
                    }}
                  >
                    Open Live Chat
                  </Button>
                  {!isCancelled && (
                    <button 
                      type="button" 
                      className="btn-cancel-booking"
                      onClick={handleCancelBooking}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Email Receipt Tab */
              <div className="invoice-tab-content">
                <div className="email-sent-banner">
                  <FiMail className="mail-icon" />
                  <div>
                    <h4>Official Tax Invoice Sent</h4>
                    <p>A copy of this digital receipt has been delivered to <strong>{customerEmail}</strong></p>
                  </div>
                </div>

                <div className="digital-invoice-card">
                  <div className="invoice-header-row">
                    <div>
                      <h3 className="brand-title">LOCALLINK INDIA</h3>
                      <span className="invoice-subtitle">Neighborhood On-Demand Services</span>
                    </div>
                    <div className="invoice-meta-right">
                      <span className="inv-badge">TAX INVOICE</span>
                      <span className="inv-no">Ref: #{bookingId}</span>
                    </div>
                  </div>

                  <hr className="inv-divider" />

                  <div className="inv-addresses-grid">
                    <div>
                      <h5>Billed To:</h5>
                      <p><strong>{customerName}</strong></p>
                      <p>{customerEmail}</p>
                      <p>{customerPhone}</p>
                      <p>Alambagh, Lucknow, UP 226005</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h5>Service Provider:</h5>
                      <p><strong>{providerName}</strong></p>
                      <p>Verified Local Partner #V-LKO-942</p>
                      <p>GSTIN: 09AAACL1234F1Z9</p>
                    </div>
                  </div>

                  <table className="inv-table">
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th>Qty</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>{serviceName}</strong>
                          <br />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Professional home service & doorstep labor</span>
                        </td>
                        <td>1</td>
                        <td style={{ textAlign: 'right' }}>{amount}</td>
                      </tr>
                      <tr>
                        <td>Platform Safety & Booking Guarantee Fee</td>
                        <td>1</td>
                        <td style={{ textAlign: 'right' }}>₹0 (FREE)</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="inv-totals-box">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>{amount}</span>
                    </div>
                    <div className="total-row">
                      <span>GST (18% Included):</span>
                      <span>Included</span>
                    </div>
                    <div className="total-row grand">
                      <span>Total Paid / Payable:</span>
                      <span>{amount}</span>
                    </div>
                  </div>

                  <div className="inv-footer-trust">
                    <FiShield className="shield-icon" /> 100% Satisfaction & Safety Guaranteed by LocalLink India
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default BookingTrackerModal;
