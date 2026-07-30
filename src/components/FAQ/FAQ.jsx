import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';
import { faqs } from '../../data/dummyData';
import './FAQ.css';

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleAccordion = (idx) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  return (
    <section className="faq-section container">
      <div className="section-header text-center">
        <span className="section-badge faq-badge">
          <FiHelpCircle className="badge-icon" /> Got Questions?
        </span>
        <h2>Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Everything you need to know about booking, payments, and service guarantees on LocalConnect India.
        </p>
      </div>

      <div className="faq-accordion-container">
        {faqs.map((faq, idx) => {
          const isOpen = activeIndex === idx;
          return (
            <div key={idx} className={`faq-item glass ${isOpen ? 'active' : ''}`}>
              <button className="faq-question-btn" onClick={() => toggleAccordion(idx)}>
                <span>{faq.question}</span>
                <FiChevronDown className={`chevron-icon ${isOpen ? 'rotated' : ''}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="faq-answer-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FAQ;
