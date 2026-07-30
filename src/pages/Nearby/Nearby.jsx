import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCompass, FiZap, FiDroplet, FiScissors, FiWind, FiBookOpen, FiCode } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import WorkerCard from '../../components/WorkerCard/WorkerCard';
import IndiaMap from '../../components/IndiaMap/IndiaMap';
import Loader from '../../components/Loader/Loader';
import { getNetworkWorkers } from '../../data/dummyData';
import { workerAPI } from '../../utils/api';
import './Nearby.css';

const chips = [
  { id: 'all', name: 'All Services', icon: FiCompass },
  { id: 'electrician', name: 'Electricians & Smart Home', icon: FiZap },
  { id: 'plumber', name: 'Plumbing', icon: FiDroplet },
  { id: 'salon', name: 'Salon at Home', icon: FiScissors },
  { id: 'cleaning', name: 'Home Deep Clean', icon: FiWind },
  { id: 'webdev', name: 'Web & App Dev', icon: FiCode },
  { id: 'tutors', name: 'IIT & School Tutors', icon: FiBookOpen }
];

function Nearby() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState('Lucknow');
  const [filteredWorkers, setFilteredWorkers] = useState(getNetworkWorkers());
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loadingMore, setLoadingMore] = useState(false);
  const listingsRef = useRef(null);

  // Scroll listings into screen center when category/search parameter is selected
  useEffect(() => {
    if (initialCategory !== 'all' || searchQuery) {
      setTimeout(() => {
        if (listingsRef.current) {
          listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  }, [initialCategory, searchQuery]);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      const netWorkers = getNetworkWorkers();
      try {
        const params = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (searchQuery.trim()) params.search = searchQuery;
        if (selectedCity) params.city = selectedCity;

        const res = await workerAPI.getAll(params);
        if (res.data?.workers?.length) {
          const customOnly = netWorkers.filter(w => typeof w.id === 'string');
          setFilteredWorkers([...customOnly, ...res.data.workers]);
        } else {
          // Local network filtering
          let result = netWorkers;
          if (activeCategory !== 'all') {
            result = result.filter(w => w.category === activeCategory);
          }
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(w => 
              w.name.toLowerCase().includes(query) || 
              w.profession.toLowerCase().includes(query) ||
              w.area.toLowerCase().includes(query)
            );
          }
          setFilteredWorkers(result);
        }
      } catch (err) {
        let result = netWorkers;
        if (activeCategory !== 'all') {
          result = result.filter(w => w.category === activeCategory);
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          result = result.filter(w => 
            w.name.toLowerCase().includes(query) || 
            w.profession.toLowerCase().includes(query) ||
            w.area.toLowerCase().includes(query)
          );
        }
        setFilteredWorkers(result);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [activeCategory, searchQuery, selectedCity]);

  const handleChipClick = (catId) => {
    setActiveCategory(catId);
    setSearchParams(catId === 'all' ? {} : { category: catId });
    setVisibleCount(4);
    if (listingsRef.current) {
      listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 2);
      setLoadingMore(false);
    }, 600);
  };

  return (
    <div className="nearby-page-wrapper">
      <Navbar />

      <main className="nearby-main-content">
        {/* Interactive India Map Connect */}
        <section className="container mt-6">
          <IndiaMap 
            selectedCity={selectedCity}
            onSelectCity={(cityName) => setSelectedCity(cityName)}
          />
        </section>

        {/* Filter chips & listings */}
        <section className="container listings-section" ref={listingsRef}>
          <div className="chips-scroller">
            {chips.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.id}
                  onClick={() => handleChipClick(chip.id)}
                  className={`filter-chip ${activeCategory === chip.id ? 'active' : ''}`}
                >
                  <Icon className="chip-icon" />
                  <span>{chip.name}</span>
                </button>
              );
            })}
          </div>

          <div className="listings-header">
            <h3>Verified Professionals in {selectedCity} & Metros ({filteredWorkers.length})</h3>
          </div>

          {loading ? (
            <div className="skeletons-wrapper">
              <Loader type="skeleton" height="240px" borderRadius="20px" className="mb-4" />
              <Loader type="skeleton" height="240px" borderRadius="20px" className="mb-4" />
            </div>
          ) : (
            <>
              {filteredWorkers.length === 0 ? (
                <div className="empty-results-card glass">
                  <p>No verified professionals found matching your filter in {selectedCity}. Try selecting "All Services".</p>
                </div>
              ) : (
                <div className="workers-list-grid">
                  <AnimatePresence>
                    {filteredWorkers.slice(0, visibleCount).map((worker) => (
                      <motion.div
                        key={worker._id || worker.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3 }}
                      >
                        <WorkerCard worker={worker} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {filteredWorkers.length > visibleCount && (
                <div className="load-more-container">
                  {loadingMore ? (
                    <Loader type="spinner" />
                  ) : (
                    <button className="btn-load-more" onClick={handleLoadMore}>
                      Load More Professionals
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Nearby;
