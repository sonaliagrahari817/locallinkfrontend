import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiCheckCircle, FiUsers, FiAward, FiMapPin, FiTrendingUp, FiHeart } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/Button/Button';
import IndiaMap from '../../components/IndiaMap/IndiaMap';
import './About.css';

function About() {
  const navigate = useNavigate();

  const stats = [
    { number: '1,50,000+', label: 'Indian Households Served', icon: FiUsers },
    { number: '15,000+', label: 'KYC Verified Professionals', icon: FiCheckCircle },
    { number: '50+', label: 'Cities Across India', icon: FiMapPin },
    { number: '4.9 ★', label: 'Average Customer Rating', icon: FiAward }
  ];

  const pillars = [
    {
      title: '100% Aadhaar & Background KYC',
      desc: 'Every electrician, plumber, cleaner, and specialist undergoes strict identity and police verification before onboarding.',
      icon: FiShield
    },
    {
      title: 'Transparent Indian Rupee Pricing',
      desc: 'No hidden surge pricing or surprise fees. Get upfront estimates in ₹ before work begins.',
      icon: FiTrendingUp
    },
    {
      title: '30-Day Protection Guarantee',
      desc: 'We back every service booking with a 30-day quality assurance warranty and instant UPI refunds if unsatisfied.',
      icon: FiCheckCircle
    },
    {
      title: 'Empowering Indian MSMEs & Freelancers',
      desc: 'We help local technicians, beauticians, tutors, and developers build sustainable digital businesses in India.',
      icon: FiHeart
    }
  ];

  return (
    <div className="about-page-wrapper">
      <Navbar />

      <main className="about-main-content">
        {/* About Hero */}
        <section className="about-hero-section">
          <div className="container about-hero-container">
            <motion.div 
              className="about-hero-badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiAward className="mr-2" /> Empowering Local India
            </motion.div>
            
            <motion.h1 
              className="about-hero-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Connecting Every Indian Household & Business with Trusted Local Professionals
            </motion.h1>

            <motion.p 
              className="about-hero-desc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Local Link is India's premier hyper-local service and business marketplace. From electrical repairs in Alambagh to web development in Lucknow, we bring quality, safety, and convenience to your doorstep.
            </motion.p>

            <motion.div 
              className="about-hero-actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="gradient" size="lg" onClick={() => navigate('/services')}>
                Explore Our Services
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/provider-dashboard')}>
                Join as a Verified Partner
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="about-stats-section container">
          <div className="stats-grid">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={idx} 
                  className="stat-card glass"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Icon className="stat-card-icon" />
                  <h3 className="stat-number">{stat.number}</h3>
                  <p className="stat-label">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Core Pillars */}
        <section className="about-pillars-section container">
          <div className="section-header text-center">
            <h2>Why Millions of Indians Trust Local Link</h2>
            <p className="section-subtitle">
              Built specifically for Indian homes, regional businesses, and micro-entrepreneurs.
            </p>
          </div>

          <div className="pillars-grid">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div 
                  key={idx}
                  className="pillar-card glass"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <div className="pillar-icon-box">
                    <Icon />
                  </div>
                  <h4>{pillar.title}</h4>
                  <p>{pillar.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Pan-India Footprint Map */}
        <section className="container">
          <IndiaMap />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;
