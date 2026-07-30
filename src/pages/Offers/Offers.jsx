import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import OfferCard from '../../components/OfferCard/OfferCard';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { offers as fallbackOffers } from '../../data/dummyData';
import { formatINR } from '../../data/formatters';
import { offerAPI } from '../../utils/api';
import './Offers.css';

function Offers() {
  const navigate = useNavigate();
  const [offersList, setOffersList] = useState(fallbackOffers);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const res = await offerAPI.getAll();
        if (res.data?.offers?.length) {
          setOffersList(res.data.offers);
        }
      } catch (err) {
        setOffersList(fallbackOffers);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleClaim = (offer) => {
    alert(`Promo code "${offer.code}" copied to clipboard! Go select a service.`);
    navigator.clipboard.writeText(offer.code);
    navigate(`/worker/1`);
  };

  return (
    <div className="offers-page-wrapper">
      <Navbar />

      <main className="offers-main-content">
        {/* Promotional Banner */}
        <section className="offers-promo-banner">
          <div className="container promo-banner-container glass">
            <div className="promo-banner-text">
              <span className="promo-tag">INDIAN FESTIVE OFFERS</span>
              <h1>Save Big on Home & Digital Services</h1>
              <p>Discover handpicked deals, seasonal vouchers, and coupon codes from vetted professionals across Indian cities.</p>
            </div>
          </div>
        </section>

        {/* Offers Grid list */}
        <section className="container offers-listings-section">
          <h2>Active Coupon Deals</h2>
          <p className="section-desc">Click any promo code to copy it, then claim the discount instantly.</p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Loader type="spinner" />
            </div>
          ) : (
            <div className="offers-page-grid">
              {offersList.map((offer) => (
                <OfferCard 
                  key={offer._id || offer.id} 
                  offer={offer} 
                  onBookClick={() => handleClaim(offer)} 
                />
              ))}
            </div>
          )}
        </section>

        {/* Custom Bundled Packages */}
        <section className="container bundled-packages-section">
          <h2>Popular Indian Bundled Packages</h2>
          <p className="section-desc">Get multiple premium services bundled together at heavily reduced Rupee prices.</p>

          <div className="bundles-grid">
            <div className="bundle-package-card glass">
              <div className="bundle-badge">BEST VALUE</div>
              <h3>Ultimate Smart Home & Inverter Bundle</h3>
              <p className="bundle-desc">Complete smart home switch wiring, inverter connection, router optimization, and security camera installs.</p>
              <div className="bundle-includes">
                <span>Includes:</span>
                <ul>
                  <li>Up to 4 modular WiFi switch installations</li>
                  <li>Inverter battery setup</li>
                  <li>Smart camera mounting</li>
                </ul>
              </div>
              <div className="bundle-footer">
                <div className="bundle-price-box">
                  <span className="bundle-price">{formatINR(2499)}</span>
                  <span className="bundle-orig-price">{formatINR(3800)}</span>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/worker/5')}>
                  Book Bundle
                </Button>
              </div>
            </div>

            <div className="bundle-package-card glass">
              <div className="bundle-badge">POPULAR</div>
              <h3>Monsoon Eco-Cleaning & AC Service</h3>
              <p className="bundle-desc">Full sanitization cleaning of 3BHK flat coupled with custom AC filter swaps and deep jet cleaning.</p>
              <div className="bundle-includes">
                <span>Includes:</span>
                <ul>
                  <li>Full 3BHK eco home deep clean</li>
                  <li>2 Split AC foam jet wash</li>
                  <li>Bathroom sanitization</li>
                </ul>
              </div>
              <div className="bundle-footer">
                <div className="bundle-price-box">
                  <span className="bundle-price">{formatINR(3199)}</span>
                  <span className="bundle-orig-price">{formatINR(4500)}</span>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/worker/4')}>
                  Book Bundle
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Offers;
