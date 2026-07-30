import React, { useState } from 'react';
import { FiCheckCircle, FiCheck, FiEdit3, FiTrash2, FiMapPin, FiExternalLink, FiDollarSign, FiMaximize2, FiX } from 'react-icons/fi';
import './ChatBubble.css';

function ChatBubble({ message, isMe, providerAvatar, userAvatar, onEdit, onDelete, onAcceptQuote }) {
  const { id, text, msgType, mediaUrl, location, priceQuote, read, timestamp, createdAt, isEdited } = message;
  const [showLightbox, setShowLightbox] = useState(false);

  const msgTimeMs = typeof id === 'string' && id.startsWith('msg_')
    ? parseInt(id.replace('msg_', ''))
    : (createdAt ? new Date(createdAt).getTime() : Date.now());
  
  const isWithin5Mins = (Date.now() - msgTimeMs) <= 5 * 60 * 1000;

  return (
    <div className={`chat-bubble-container ${isMe ? 'msg-right' : 'msg-left'}`}>
      {!isMe && (
        <img 
          src={providerAvatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=100&q=80'} 
          alt="Provider" 
          className="bubble-avatar" 
        />
      )}
      <div className={`chat-bubble ${msgType ? `bubble-type-${msgType}` : ''}`}>
        
        {/* Photo Attachment */}
        {(msgType === 'image' || mediaUrl) && (
          <div className="bubble-media-preview" onClick={() => setShowLightbox(true)}>
            <img src={mediaUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'} alt="Attachment" />
            <div className="media-zoom-overlay">
              <FiMaximize2 />
            </div>
          </div>
        )}

        {/* Location Attachment */}
        {msgType === 'location' && location && (
          <div className="bubble-location-card">
            <div className="location-card-header">
              <FiMapPin className="pin-icon" />
              <span>Shared Location Pin</span>
            </div>
            <p className="location-address-name">{location.addressName || 'Alambagh Market, Lucknow, UP'}</p>
            <a
              href={`https://maps.google.com/?q=${location.latitude || 26.8122},${location.longitude || 80.8986}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open-maps"
            >
              Open in Google Maps <FiExternalLink />
            </a>
          </div>
        )}

        {/* Price Quote Attachment */}
        {msgType === 'priceQuote' && priceQuote && (
          <div className="bubble-quote-card">
            <div className="quote-header">
              <FiDollarSign className="quote-icon" />
              <span>Official Service Quote</span>
            </div>
            <h4 className="quote-title">{priceQuote.serviceTitle || 'Custom Service Package'}</h4>
            <p className="quote-amount">{priceQuote.amount || '₹799'}</p>
            {priceQuote.description && <p className="quote-desc">{priceQuote.description}</p>}
            {!isMe && (
              <button
                type="button"
                className="btn-accept-quote"
                onClick={() => onAcceptQuote && onAcceptQuote(priceQuote)}
              >
                Accept Quote & Book
              </button>
            )}
          </div>
        )}

        {/* Text Message Content */}
        {text && (
          <p className="chat-msg-text">
            {text} {isEdited && <span className="edited-badge">(edited)</span>}
          </p>
        )}

        {/* Metadata Footer */}
        <div className="chat-msg-meta">
          <span className="chat-msg-time">{timestamp || 'Just now'}</span>
          {isMe && (
            <div className="msg-status-actions">
              {isWithin5Mins && (
                <>
                  <button 
                    type="button"
                    onClick={() => onEdit && onEdit(id, text)}
                    className="msg-action-btn edit"
                    title="Edit message (within 5 minutes)"
                  >
                    <FiEdit3 />
                  </button>
                  <button 
                    type="button"
                    onClick={() => onDelete && onDelete(id)}
                    className="msg-action-btn delete"
                    title="Delete message (within 5 minutes)"
                  >
                    <FiTrash2 />
                  </button>
                </>
              )}
              <span className={`chat-read-tick ${read ? 'read-blue' : 'sent'}`} title={read ? "Read" : "Sent"}>
                {read ? <FiCheckCircle className="tick-icon read" /> : <FiCheck className="tick-icon sent" />}
              </span>
            </div>
          )}
        </div>
      </div>

      {isMe && (
        <img 
          src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
          alt="You" 
          className="bubble-avatar user-avatar-bubble" 
        />
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button type="button" className="lightbox-close" onClick={() => setShowLightbox(false)}>
              <FiX />
            </button>
            <img src={mediaUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'} alt="Attachment Full View" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBubble;
