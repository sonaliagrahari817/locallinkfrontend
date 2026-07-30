import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlusCircle } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import CommunityCard from '../../components/CommunityCard/CommunityCard';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { posts as initialPosts } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../utils/api';
import defaultAvatarImg from '../../assets/images/NoProfilePicture.png';
import './Community.css';

const categories = ["All Posts", "Looking For", "For Sale", "Lost & Found"];

function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [loading, setLoading] = useState(false);
  
  // New post state
  const [postText, setPostText] = useState("");
  const [postCategory, setPostCategory] = useState("Looking For");
  const [showPublisher, setShowPublisher] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await postAPI.getAll({ category: activeCategory });
        if (res.data?.posts?.length) {
          setPosts(res.data.posts);
        } else {
          setPosts(initialPosts);
        }
      } catch (err) {
        setPosts(initialPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeCategory]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (postText.trim() === "") return;

    try {
      const res = await postAPI.create({
        category: postCategory,
        description: postText,
      });

      if (res.data?.post) {
        setPosts([res.data.post, ...posts]);
      }
    } catch (err) {
      const newPost = {
        id: Date.now(),
        name: user?.name || "Local User",
        avatar: user?.avatar || defaultAvatarImg,
        time: "Just now",
        category: postCategory,
        description: postText,
        likes: 0,
        commentsCount: 0
      };
      setPosts([newPost, ...posts]);
    }

    setPostText("");
    setShowPublisher(false);
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await postAPI.toggleLike(postId);
      setPosts(posts.map(p => {
        if ((p._id || p.id) === postId) {
          return { ...p, likes: res.data.likes };
        }
        return p;
      }));
    } catch (err) {
      setPosts(posts.map(p => {
        if ((p._id || p.id) === postId) {
          return { ...p, likes: (p.likes || 0) + 1 };
        }
        return p;
      }));
    }
  };

  const filteredPosts = activeCategory === "All Posts"
    ? posts
    : posts.filter(p => p.category?.toLowerCase() === activeCategory?.toLowerCase());

  return (
    <div className="community-page-wrapper">
      <Navbar />

      <main className="community-main container">
        <div className="community-header-section">
          <div>
            <h1 className="community-title">Community Board</h1>
            <p className="community-subtitle">Connect with your neighborhood, find items, and share notices.</p>
          </div>
          <Button variant="primary" onClick={() => setShowPublisher(!showPublisher)} icon={FiPlusCircle}>
            Create Post
          </Button>
        </div>

        {/* Create Post Form */}
        <AnimatePresence>
          {showPublisher && (
            <motion.div 
              className="create-post-card glass"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <form onSubmit={handleCreatePost}>
                <div className="form-row-header">
                  <img src={user?.avatar || defaultAvatarImg} alt="Me" className="publisher-avatar" />
                  <div className="publisher-meta">
                    <span className="publisher-name">{user?.name || "Local User"}</span>
                    <select 
                      value={postCategory} 
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="publisher-category-select"
                    >
                      <option value="Looking For">Looking For</option>
                      <option value="For Sale">For Sale</option>
                      <option value="Lost & Found">Lost & Found</option>
                    </select>
                  </div>
                </div>

                <textarea
                  placeholder="What is happening in your neighborhood?"
                  required
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />

                <div className="publisher-actions">
                  <Button variant="ghost" size="sm" onClick={() => setShowPublisher(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" size="sm">
                    Publish Post
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Board Category Nav */}
        <div className="forum-categories-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`forum-tab-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        <div className="posts-feed-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Loader type="spinner" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="empty-feed-card glass">
              <p>No postings in category "{activeCategory}" yet. Be the first to share something!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post._id || post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <CommunityCard 
                    post={post} 
                    onLikeClick={() => handleLikePost(post._id || post.id)}
                    onMessageClick={() => alert(`Opening chat for post by ${post.name}...`)} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Community;
