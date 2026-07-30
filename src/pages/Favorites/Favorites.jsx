import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import WorkerCard from '../../components/WorkerCard/WorkerCard';
import Loader from '../../components/Loader/Loader';
import { workers as fallbackWorkers } from '../../data/dummyData';
import { userAPI } from '../../utils/api';
import './Favorites.css';

function Favorites() {
  const [favoriteWorkers, setFavoriteWorkers] = useState([fallbackWorkers[0], fallbackWorkers[1]]);
  const [activeTab, setActiveTab] = useState("workers");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getFavorites();
        if (res.data?.favorites?.length) {
          setFavoriteWorkers(res.data.favorites);
        }
      } catch (err) {
        console.log('Using local favorites state');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemove = async (workerId) => {
    try {
      await userAPI.removeFavorite(workerId);
    } catch (err) {
      console.log('Removed from local favorites');
    }
    setFavoriteWorkers(prev => prev.filter(w => (w._id || w.id) !== workerId));
  };

  return (
    <div className="favorites-page-wrapper">
      <Navbar />

      <main className="favorites-main container">
        <h1 className="favorites-title">My Favorites</h1>
        <p className="favorites-subtitle">Quick access to your saved professionals and businesses.</p>

        {/* Tab Selector */}
        <div className="favorites-tabs">
          <button 
            onClick={() => setActiveTab("workers")} 
            className={`favorites-tab-btn ${activeTab === "workers" ? "active" : ""}`}
          >
            Saved Workers ({favoriteWorkers.length})
          </button>
          <button 
            onClick={() => setActiveTab("shops")} 
            className={`favorites-tab-btn ${activeTab === "shops" ? "active" : ""}`}
          >
            Saved Shops (0)
          </button>
        </div>

        {/* Listings content */}
        {activeTab === "workers" ? (
          <div className="favorites-grid-wrapper">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Loader type="spinner" />
              </div>
            ) : favoriteWorkers.length === 0 ? (
              <div className="empty-favorites glass">
                <FiHeart className="empty-heart-icon" />
                <h3>No saved workers yet</h3>
                <p>Explore nearby workers and click the bookmark button on their profiles to save them.</p>
              </div>
            ) : (
              <div className="favorites-listings-grid">
                <AnimatePresence>
                  {favoriteWorkers.map((worker) => (
                    <motion.div 
                      key={worker._id || worker.id}
                      className="fav-card-item-wrapper"
                      layout
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <button 
                        className="fav-remove-btn" 
                        onClick={() => handleRemove(worker._id || worker.id)}
                        title="Remove from favorites"
                      >
                        <FiTrash2 />
                      </button>
                      <WorkerCard worker={worker} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-favorites glass">
            <FiHeart className="empty-heart-icon" />
            <h3>No saved shops yet</h3>
            <p>You haven't favorited any local hardware stores or pharmacy shops yet.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Favorites;
