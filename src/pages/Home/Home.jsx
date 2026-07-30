import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiShield, FiMessageSquare, FiActivity, FiBriefcase, FiCheckCircle, FiCompass, FiZap, FiDroplet, FiScissors, FiWind, FiCode, FiBookOpen, FiTool, FiGrid, FiShoppingBag, FiPlusCircle, FiCpu, FiSmartphone, FiSearch, FiCloud, FiMapPin } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import SearchBar from '../../components/SearchBar/SearchBar';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import WorkerCard from '../../components/WorkerCard/WorkerCard';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import OfferCard from '../../components/OfferCard/OfferCard';
import CommunityCard from '../../components/CommunityCard/CommunityCard';
import IndiaMap from '../../components/IndiaMap/IndiaMap';
import Testimonials from '../../components/Testimonials/Testimonials';
import FAQ from '../../components/FAQ/FAQ';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { categories, getNetworkWorkers, getNetworkServices, offers as fallbackOffers, posts as fallbackPosts, indianServicesCatalog } from '../../data/dummyData';
import { workerAPI, serviceAPI, offerAPI, postAPI, bookingAPI } from '../../utils/api';
import './Home.css';

// Map icon string names to actual components for suggestions
const iconMap = {
  FiZap: <FiZap />, FiDroplet: <FiDroplet />, FiScissors: <FiScissors />,
  FiWind: <FiWind />, FiCode: <FiCode />, FiTrendingUp: <FiTrendingUp />,
  FiBookOpen: <FiBookOpen />, FiTool: <FiTool />, FiGrid: <FiGrid />,
  FiShoppingBag: <FiShoppingBag />, FiPlusCircle: <FiPlusCircle />,
  FiCpu: <FiCpu />, FiSmartphone: <FiSmartphone />, FiSearch: <FiSearch />,
  FiCloud: <FiCloud />, MdCleaningServices: <FiWind />,
};

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // API Data State with fallbacks
  const [nearbyServices, setNearbyServices] = useState(getNetworkServices());
  const [topWorkers, setTopWorkers] = useState(getNetworkWorkers().slice(0, 6));
  const [offersList, setOffersList] = useState(fallbackOffers);
  const [postsList, setPostsList] = useState(fallbackPosts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      const netWorkers = getNetworkWorkers();
      const netServices = getNetworkServices();

      try {
        const [workersRes, servicesRes, offersRes, postsRes] = await Promise.allSettled([
          workerAPI.getAll({ limit: 6 }),
          serviceAPI.getAll({ limit: 6 }),
          offerAPI.getAll(),
          postAPI.getAll({ limit: 2 }),
        ]);

        if (workersRes.status === 'fulfilled' && workersRes.value.data?.workers?.length) {
          const apiWorkers = workersRes.value.data.workers;
          const customOnly = netWorkers.filter(w => typeof w.id === 'string');
          setTopWorkers([...customOnly, ...apiWorkers]);
        } else {
          setTopWorkers(netWorkers);
        }

        if (servicesRes.status === 'fulfilled' && servicesRes.value.data?.services?.length) {
          const apiServices = servicesRes.value.data.services;
          const customSvcOnly = netServices.filter(s => typeof s.id === 'string');
          setNearbyServices([...customSvcOnly, ...apiServices]);
        } else {
          setNearbyServices(netServices);
        }

        if (offersRes.status === 'fulfilled' && offersRes.value.data?.offers?.length) {
          setOffersList(offersRes.value.data.offers);
        }
        if (postsRes.status === 'fulfilled' && postsRes.value.data?.posts?.length) {
          setPostsList(postsRes.value.data.posts);
        }
      } catch (err) {
        console.log('Using local fallback data for home page');
        setTopWorkers(netWorkers);
        setNearbyServices(netServices);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Build the searchable suggestions list
  const searchSuggestions = useMemo(() => {
    const items = [];

    // 1. Categories
    categories.forEach((cat) => {
      items.push({
        id: `cat-${cat.id}`,
        label: cat.name,
        subtitle: 'Service Category',
        category: cat.id,
        icon: iconMap[cat.icon] || <FiGrid />,
        color: cat.color,
        badge: 'Category',
        keywords: cat.id,
        route: `/nearby?category=${cat.id}`,
      });
    });

    // 2. Nearby local services
    nearbyServices.forEach((svc) => {
      items.push({
        id: `svc-${svc.id || svc._id}`,
        label: svc.title || svc.name,
        subtitle: `${svc.distance || ''} · ${svc.area || svc.city || ''}`.replace(/^ · /, ''),
        category: svc.category,
        icon: iconMap[svc.icon] || <FiCompass />,
        badge: svc.price,
        keywords: `${svc.category} ${svc.description || ''} ${svc.area || ''}`,
        route: `/services?category=${svc.category}&search=${encodeURIComponent(svc.title || svc.name)}`,
      });
    });

    // 3. Top workers
    topWorkers.forEach((w) => {
      items.push({
        id: `worker-${w.id || w._id}`,
        label: `${w.name} — ${w.profession}`,
        subtitle: `${w.distance || ''} · ⭐ ${w.rating}`,
        category: w.category,
        icon: iconMap[w.icon] || <FiTool />,
        badge: w.pricePerHour,
        keywords: `${w.category} ${w.profession} ${w.area || ''}`,
        route: `/worker/${w.id || w._id}`,
      });
    });

    // 4. Digital / Indian services catalog
    indianServicesCatalog.forEach((svc) => {
      items.push({
        id: `digital-${svc.id}`,
        label: svc.title,
        subtitle: svc.price ? `${svc.category} · ${svc.price}` : svc.category,
        category: svc.category,
        icon: iconMap[svc.icon] || <FiCode />,
        badge: 'Digital',
        keywords: `${svc.category} ${svc.description} ${(svc.features || []).join(' ')}`,
        route: `/services?search=${encodeURIComponent(svc.title)}`,
      });
    });

    return items;
  }, [nearbyServices]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
  };

  const handleSearchSubmit = (val, suggestion) => {
    if (suggestion?.route) {
      navigate(suggestion.route);
    } else if (val.trim() !== "") {
      navigate(`/nearby?search=${encodeURIComponent(val)}`);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/nearby?category=${categoryId}`);
  };

  const handleCallWorker = (worker) => {
    if (worker.phone) {
      window.location.href = `tel:${worker.phone}`;
    } else {
      alert(`Connecting to ${worker.name}...`);
    }
  };

  const handleClaimOffer = (offer) => {
    navigator.clipboard.writeText(offer.code || 'INDIA30');
    alert(`Offer "${offer.title}" claimed! Promo code ${offer.code} copied to clipboard.`);
    navigate(`/worker/${offer.id || 1}`);
  };

  const handleBookNearbyService = async (service) => {
    try {
      await bookingAPI.create({
        service: service.title || service.name,
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        amount: service.price || '₹349',
      });
      alert(`Booking request for ${service.title || service.name} submitted! Local partner will call you in 10 mins.`);
    } catch (err) {
      alert(`Booking request for ${service.title || service.name} received! Local partner will contact you shortly.`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="home-page-wrapper">
      <Navbar />

      <main className="home-main-content">
        {/* Premium Hero Section */}
        <section className="hero-section">
          <div className="container hero-container">
            <div className="hero-text-content">
              <motion.div
                className="hero-badge-pill"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <FiShield className="badge-icon" /> 100% Aadhaar & KYC Verified Local Professionals
              </motion.div>

              <motion.h1
                className="hero-main-title"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Discover Nearby Local Services in Your Area
              </motion.h1>

              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Book emergency electricians, plumbers, AC servicing, deep cleaning, carpenters, express grocery delivery, and 24/7 medical services within 0.5 km to 3.0 km.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="hero-search-wrapper"
              >
                <SearchBar
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onSubmit={handleSearchSubmit}
                  suggestions={searchSuggestions}
                  placeholder="Search nearby services..."
                  onFilterClick={() => navigate('/services')}
                />
              </motion.div>

              <div className="hero-quick-tags">
                <span>Nearby:</span>
                <button onClick={() => navigate('/services?category=electrician')}>Electrician (1.2 km)</button>
                <button onClick={() => navigate('/services?category=plumber')}>Plumber (0.8 km)</button>
                <button onClick={() => navigate('/services?category=cleaning')}>AC Jet Service (1.5 km)</button>
                <button onClick={() => navigate('/services?category=grocery')}>Express Grocery (20m)</button>
              </div>

              {/* Trust Indicators */}
              <div className="hero-trust-bar">
                <div className="trust-item">
                  <FiCheckCircle className="trust-icon" />
                  <span>1.5L+ Indian Homes</span>
                </div>
                <div className="trust-item">
                  <FiCheckCircle className="trust-icon" />
                  <span>Transparent ₹ Rates</span>
                </div>
                <div className="trust-item">
                  <FiCheckCircle className="trust-icon" />
                  <span>UPI Instant Refunds</span>
                </div>
              </div>
            </div>

            <div className="hero-graphic-container">
              <div className="hero-slideshow-viewport glass">
                <div className="slideshow-header-bar">
                  <span className="live-dot"></span>
                  <span>Verified Local Service Providers</span>
                </div>
                
                <div className="hero-slideshow-track">
                  {[...topWorkers, ...topWorkers].map((worker, index) => {
                    const targetId = worker._id || worker.id;
                    const serviceTag = 
                      worker.category === 'electrician' ? 'Master Electrician' :
                      worker.category === 'plumber' ? 'Master Plumber' :
                      worker.category === 'salon' ? 'Salon & Beauty' :
                      worker.category === 'cleaning' ? 'Deep Cleaning' :
                      worker.category === 'webdev' ? 'Fullstack Dev' :
                      worker.category === 'tutors' ? 'IIT Physics Tutor' :
                      (worker.profession ? worker.profession.split('&')[0] : 'Local Service');

                    return (
                      <div
                        key={`${targetId}-${index}`}
                        className="provider-slide-card"
                        onClick={() => navigate(`/worker/${targetId}`)}
                        title={`Click to hire ${worker.name}`}
                      >
                        <img src={worker.image} alt={worker.name} className="provider-slide-img" />
                        
                        {/* Top Right Corner Tag: Local Service */}
                        <span className="tag-service-top-right">
                          {serviceTag}
                        </span>

                        {/* Bottom Left Corner Tag: Distance */}
                        <span className="tag-distance-bottom-left">
                          <FiMapPin className="pin-icon" /> {worker.distance || '1.2 km'} away
                        </span>

                        {/* Hover Overlay */}
                        <div className="provider-slide-hover">
                          <span className="hover-name">{worker.name}</span>
                          <span className="hover-hire-btn">Hire Now →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Local Services Grid Section */}
        <section className="nearby-services-spotlight container">
          <div className="section-header">
            <div className="section-title-with-icon">
              <FiCompass className="header-icon" />
              <div>
                <h2>Nearby Local Services (Alambagh, Lucknow)</h2>
                <p className="section-sub-text">Verified emergency professionals available within 0.5 km to 2.5 km</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/services')}>
              View All Services
            </Button>
          </div>

          <div className="home-nearby-grid">
            {nearbyServices.slice(0, 4).map((service) => (
              <ServiceCard
                key={service._id || service.id}
                service={service}
                onBookClick={handleBookNearbyService}
              />
            ))}
          </div>
        </section>

        {/* Popular Service Categories */}
        <section className="categories-section container">
          <div className="section-header">
            <div>
              <h2>Popular Categories</h2>
              <p className="section-sub-text">Explore local service specialists in your neighborhood</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/nearby')}>
              View All
            </Button>
          </div>
          <motion.div
            className="categories-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={itemVariants}>
                <CategoryCard category={cat} onClick={() => handleCategoryClick(cat.id)} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Interactive Map Radar Connect */}
        <section className="container mt-12">
          <IndiaMap />
        </section>

        {/* Top Rated Workers Section */}
        <section className="top-workers-section container">
          <div className="section-header">
            <div className="section-title-with-icon">
              <FiTrendingUp className="header-icon" />
              <div>
                <h2>Top-Rated Nearby Professionals</h2>
                <p className="section-sub-text">Aadhaar-verified specialists with 4.8+ ratings</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/nearby')}>
              Explore All
            </Button>
          </div>
          <div className="workers-grid">
            {topWorkers.map((worker) => (
              <WorkerCard
                key={worker._id || worker.id}
                worker={worker}
                onCallClick={handleCallWorker}
              />
            ))}
          </div>
        </section>

        {/* Digital & Business Services Spotlight */}
        <section className="business-spotlight-section container">
          <div className="section-header">
            <div className="section-title-with-icon">
              <FiBriefcase className="header-icon" />
              <div>
                <h2>Digital Services for Indian Businesses</h2>
                <p className="section-sub-text">Web Apps, E-commerce Stores with Razorpay, & SEO</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
              View Digital Catalog
            </Button>
          </div>
          <div className="spotlight-grid">
            {indianServicesCatalog.slice(0, 3).map((svc) => (
              <div key={svc.id} className="spotlight-card glass">
                <span className="spotlight-cat">{svc.category}</span>
                <h4>{svc.title}</h4>
                <p>{svc.description}</p>
                <div className="spotlight-footer">
                  <Button variant="primary" size="sm" onClick={() => navigate('/services')}>
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Today's Offers Section */}
        <section className="offers-section container">
          <div className="section-header">
            <div className="section-title-with-icon">
              <FiActivity className="header-icon" />
              <div>
                <h2>Exclusive Festive Offers</h2>
                <p className="section-sub-text">Save big with instant coupon discounts</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/offers')}>
              All Vouchers
            </Button>
          </div>
          <div className="offers-grid">
            {offersList.map((offer) => (
              <OfferCard
                key={offer._id || offer.id}
                offer={offer}
                onBookClick={() => handleClaimOffer(offer)}
              />
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Community Forum Preview */}
        <section className="community-preview-section container">
          <div className="section-header">
            <div className="section-title-with-icon">
              <FiMessageSquare className="header-icon" />
              <div>
                <h2>Recent Community Posts</h2>
                <p className="section-sub-text">Neighborhood updates & recommendations</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>
              Open Forum
            </Button>
          </div>
          <div className="community-posts-container">
            {postsList.slice(0, 2).map((post) => (
              <CommunityCard
                key={post._id || post.id}
                post={post}
                onMessageClick={() => navigate('/chat/1')}
              />
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}

export default Home;
