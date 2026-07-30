import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  FiArrowLeft,
  FiSend,
  FiSmile,
  FiPhone,
  FiCalendar,
  FiUser,
  FiPaperclip,
  FiMapPin,
  FiShield,
  FiCheckCircle,
  FiSearch,
  FiImage,
  FiDollarSign,
  FiArrowDown,
  FiX,
  FiCheck,
  FiPlus
} from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import ChatBubble from '../../components/ChatBubble/ChatBubble';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { 
  workers, 
  getNetworkWorkers, 
  getNetworkServices,
  getNetworkBookings,
  getPersistentChatMessages, 
  savePersistentChatMessage,
  editPersistentChatMessage,
  deletePersistentChatMessage 
} from '../../data/dummyData';
import { messageAPI } from '../../utils/api';
import defaultAvatarImg from '../../assets/images/NoProfilePicture.png';
import './Chat.css';

const popularEmojis = ["😊", "👍", "🙌", "👋", "💡", "🛠️", "📅", "💯", "🙏", "⚡", "🔧", "⭐", "📍", "💵"];

const quickPrompts = [
  { label: "📅 Can you visit today at 4 PM?", text: "Hi, can you visit my location today around 4:00 PM for the service?" },
  { label: "💰 What is the estimated cost?", text: "Could you please provide an estimated cost for this service?" },
  { label: "📍 Sending my exact location", text: "I'm located in Alambagh Market, Lucknow. How quickly can you reach?" },
  { label: "⚡ Emergency repair needed", text: "This is an urgent requirement. Are you available for immediate dispatch?" },
];

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? window.location.origin
      : 'http://localhost:5000');

function Chat() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const targetId = routeId || searchParams.get('workerId') || searchParams.get('id');
  const targetName = searchParams.get('name') || searchParams.get('workerName');
  const targetAvatar = searchParams.get('avatar');

  // Unified contacts directory combining network workers, published service providers, and customer contacts
  const allNetworkWorkers = getNetworkWorkers();
  const networkServices = getNetworkServices();
  const networkBookings = getNetworkBookings(user?._id || user?.email);

  const extraProvidersFromServices = networkServices
    .filter(s => s.providerName || s.title || s.name)
    .map(s => ({
      id: s.providerId || s.provider || s.id || s._id,
      _id: s.providerId || s.provider || s._id || s.id,
      name: s.providerName || s.name || s.title || 'Service Provider',
      profession: s.title || s.name || 'Service Specialist',
      avatar: s.providerAvatar || s.avatar || defaultAvatarImg,
      phone: s.phone || '+91 98765 43210',
      rating: s.rating || 5.0,
      reviewsCount: s.reviewsCount || 1,
      area: s.area || 'Lucknow, UP',
      isOnline: true,
      contactType: 'provider'
    }));

  const customerContactsFromBookings = networkBookings.map(b => ({
    id: b.customer?._id || b.customer || ('cust_' + (b._id || b.id || b.bookingId)),
    _id: b.customer?._id || b.customer || ('cust_' + (b._id || b.id || b.bookingId)),
    name: b.customerName || b.customer?.name || 'Customer',
    profession: `Client • ${b.service}`,
    avatar: b.customer?.avatar || defaultAvatarImg,
    phone: b.customer?.phone || '+91 98765 12345',
    rating: 5.0,
    reviewsCount: 1,
    area: 'Lucknow, UP',
    isOnline: true,
    contactType: 'client'
  }));

  const contactsMap = new Map();
  [...allNetworkWorkers.map(w => ({ ...w, contactType: 'provider' })), ...extraProvidersFromServices, ...customerContactsFromBookings].forEach(w => {
    const key = String(w._id || w.id || w.name).toLowerCase();
    if (!contactsMap.has(key)) {
      contactsMap.set(key, w);
    }
  });

  const unifiedContactsList = Array.from(contactsMap.values());

  const findWorkerTarget = (tId, tName) => {
    if (tId) {
      const match = unifiedContactsList.find(w =>
        String(w.id) === String(tId) ||
        String(w._id) === String(tId)
      );
      if (match) return match;
    }
    if (tName) {
      const matchName = unifiedContactsList.find(w =>
        w.name.toLowerCase() === tName.toLowerCase()
      );
      if (matchName) return matchName;
    }
    if (tId || tName) {
      return {
        id: tId || 'w_' + Date.now(),
        _id: tId || 'w_' + Date.now(),
        name: tName || 'Service Provider',
        profession: 'Verified Service Provider',
        avatar: targetAvatar || defaultAvatarImg,
        phone: '+91 98765 43210',
        rating: 5.0,
        reviewsCount: 1,
        area: 'Lucknow, UP',
        isOnline: true,
        contactType: 'provider'
      };
    }
    return unifiedContactsList[0] || workers[0];
  };

  const [currentWorker, setCurrentWorker] = useState(() => findWorkerTarget(targetId, targetName));
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'providers' | 'clients'
  const [threadSearch, setThreadSearch] = useState("");
  const [showThreadSearch, setShowThreadSearch] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Modals & Attachments
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({ title: '', amount: '₹', desc: '' });

  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Update target contact when route changes
  useEffect(() => {
    const resolved = findWorkerTarget(targetId, targetName);
    if (resolved) {
      setCurrentWorker(resolved);
    }
  }, [routeId, targetId, targetName]);

  // Connect Socket.io client & join room
  useEffect(() => {
    if (!user || !currentWorker) return;

    const myId = String(user._id || user.email || 'user');
    const partnerId = String(currentWorker._id || currentWorker.id || currentWorker.name);
    const room = [myId, partnerId].sort().join("_");

    try {
      const socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join_room', room);
      });

      socket.on('receive_message', (newMsg) => {
        const formatted = {
          id: newMsg._id || 'msg_' + Date.now(),
          createdAt: new Date(newMsg.createdAt || Date.now()).getTime(),
          sender: String(newMsg.sender) === String(user?._id)
            ? (user?.role === 'provider' ? 'provider' : 'user')
            : (user?.role === 'provider' ? 'customer' : 'worker'),
          text: newMsg.text,
          msgType: newMsg.msgType || 'text',
          mediaUrl: newMsg.mediaUrl || '',
          location: newMsg.location || null,
          priceQuote: newMsg.priceQuote || null,
          read: true,
          timestamp: new Date(newMsg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => {
          if (prev.some(m => String(m.id) === String(formatted.id))) return prev;
          return [...prev, formatted];
        });
      });

      socket.on('user_typing', (data) => {
        if (String(data.sender) !== String(myId)) {
          setIsTyping(true);
        }
      });

      socket.on('user_stopped_typing', (data) => {
        if (String(data.sender) !== String(myId)) {
          setIsTyping(false);
        }
      });

      socket.on('message_read_update', () => {
        setMessages(prev => prev.map(m => ({ ...m, read: true })));
      });

      socket.on('message_edited', (updatedMsg) => {
        setMessages(prev => prev.map(m => String(m.id) === String(updatedMsg._id) ? { ...m, text: updatedMsg.text, isEdited: true } : m));
      });

      socket.on('message_deleted', (data) => {
        setMessages(prev => prev.filter(m => String(m.id) !== String(data.messageId)));
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.log('Socket client fallback');
    }
  }, [user, currentWorker]);

  // Load chat messages when currentWorker updates
  useEffect(() => {
    if (!currentWorker) return;

    const fetchChatHistory = async () => {
      const workerKey = currentWorker._id || currentWorker.id || currentWorker.name;

      try {
        const res = await messageAPI.getMessages(workerKey);
        if (res.data?.messages?.length) {
          const formatted = res.data.messages.map(m => ({
            id: m._id,
            createdAt: new Date(m.createdAt).getTime(),
            sender: String(m.sender) === String(user?._id)
              ? (user?.role === 'provider' ? 'provider' : 'user')
              : (user?.role === 'provider' ? 'customer' : 'worker'),
            text: m.text,
            msgType: m.msgType || 'text',
            mediaUrl: m.mediaUrl || '',
            location: m.location || null,
            priceQuote: m.priceQuote || null,
            read: m.read || false,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages(formatted);

          // Mark as read in backend
          messageAPI.markAsRead(workerKey).catch(() => {});
          return;
        }
      } catch (err) {
        // Fallback to local storage history
      }

      const persistent = getPersistentChatMessages(user, currentWorker);
      setMessages(persistent || []);
    };

    fetchChatHistory();
    const intervalId = setInterval(fetchChatHistory, 3000);
    return () => clearInterval(intervalId);
  }, [currentWorker, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Scroll detection for scroll-to-bottom button
  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socketRef.current) return;

    const myId = String(user?._id || user?.email || 'user');
    const partnerId = String(currentWorker?._id || currentWorker?.id || currentWorker?.name);
    const room = [myId, partnerId].sort().join("_");

    socketRef.current.emit('typing', { room, sender: myId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop_typing', { room, sender: myId });
    }, 1500);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachmentPreview) return;

    const currentText = inputText.trim();
    const msgCreatedAt = Date.now();
    const msgId = 'msg_' + msgCreatedAt;

    const isProviderAccount = user?.role === 'provider';
    const isImage = !!attachmentPreview;

    const userMessage = {
      id: msgId,
      createdAt: msgCreatedAt,
      sender: isProviderAccount ? 'provider' : 'user',
      text: currentText,
      msgType: isImage ? 'image' : 'text',
      mediaUrl: attachmentPreview || '',
      read: true,
      timestamp: new Date(msgCreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setShowEmojis(false);
    setAttachmentPreview(null);

    savePersistentChatMessage(user, currentWorker, userMessage);

    const myId = String(user?._id || user?.email || 'user');
    const partnerId = String(currentWorker?._id || currentWorker?.id || currentWorker?.name);
    const room = [myId, partnerId].sort().join("_");

    if (socketRef.current) {
      socketRef.current.emit('stop_typing', { room, sender: myId });
      socketRef.current.emit('send_message', {
        room,
        sender: myId,
        receiver: partnerId,
        text: currentText,
        msgType: isImage ? 'image' : 'text',
        mediaUrl: attachmentPreview || '',
        createdAt: new Date().toISOString()
      });
    }

    try {
      await messageAPI.sendMessage({
        receiverId: currentWorker._id || currentWorker.id,
        text: currentText,
        msgType: isImage ? 'image' : 'text',
        mediaUrl: attachmentPreview || '',
        workerId: currentWorker._id || currentWorker.id,
      });
    } catch (err) {
      console.log('Saved message locally');
    }

    // Automated reply ONLY for static demo workers when chatting as a customer
    const isStaticDemoWorker = workers.some(w => String(w.id) === String(currentWorker.id) || String(w._id) === String(currentWorker.id));
    if (isStaticDemoWorker && !isProviderAccount) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyTime = Date.now();
        const workerResponse = {
          id: 'msg_' + replyTime,
          createdAt: replyTime,
          sender: 'worker',
          text: getCustomReply(currentWorker, currentText),
          msgType: 'text',
          read: true,
          timestamp: new Date(replyTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, workerResponse]);
        savePersistentChatMessage(user, currentWorker, workerResponse);
      }, 1400);
    }
  };

  const handleShareLocation = () => {
    setShowLocationModal(true);
  };

  const confirmShareLocation = () => {
    const msgCreatedAt = Date.now();
    const locMsg = {
      id: 'msg_' + msgCreatedAt,
      createdAt: msgCreatedAt,
      sender: user?.role === 'provider' ? 'provider' : 'user',
      text: "📍 Shared Site Location Pin",
      msgType: 'location',
      location: {
        latitude: 26.8122,
        longitude: 80.8986,
        addressName: 'Alambagh Market, Near Phoenix Mall, Lucknow, UP 226005'
      },
      read: true,
      timestamp: new Date(msgCreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, locMsg]);
    savePersistentChatMessage(user, currentWorker, locMsg);
    setShowLocationModal(false);
  };

  const handleSendQuote = () => {
    setShowQuoteModal(true);
  };

  const confirmSendQuote = () => {
    if (!quoteFormData.title || !quoteFormData.amount) return;
    const msgCreatedAt = Date.now();
    const quoteMsg = {
      id: 'msg_' + msgCreatedAt,
      createdAt: msgCreatedAt,
      sender: 'provider',
      text: `💰 Official Service Quote: ${quoteFormData.title} (${quoteFormData.amount})`,
      msgType: 'priceQuote',
      priceQuote: {
        serviceTitle: quoteFormData.title,
        amount: quoteFormData.amount,
        description: quoteFormData.desc || 'Includes parts & service guarantee.',
        status: 'pending'
      },
      read: true,
      timestamp: new Date(msgCreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, quoteMsg]);
    savePersistentChatMessage(user, currentWorker, quoteMsg);
    setShowQuoteModal(false);
    setQuoteFormData({ title: '', amount: '₹', desc: '' });
  };

  const handleAcceptQuote = (quoteObj) => {
    navigate(`/worker/${currentWorker._id || currentWorker.id}`);
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditMessage = async (msgId, currentText) => {
    const newText = window.prompt("Edit your message (Sent within 5 minutes):", currentText);
    if (!newText || !newText.trim() || newText === currentText) return;

    try {
      await messageAPI.editMessage(msgId, newText.trim());
    } catch (err) {
      console.log('Edited message locally');
    }

    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: newText.trim(), isEdited: true } : m));
    if (currentWorker) {
      editPersistentChatMessage(user, currentWorker, msgId, newText.trim());
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Delete this message? (Sent within 5 minutes)")) return;

    try {
      await messageAPI.deleteMessage(msgId);
    } catch (err) {
      console.log('Deleted message locally');
    }

    setMessages(prev => prev.filter(m => m.id !== msgId));
    if (currentWorker) {
      deletePersistentChatMessage(user, currentWorker, msgId);
    }
  };

  const getCustomReply = (workerObj, query) => {
    const q = query.toLowerCase();
    if (q.includes('schedule') || q.includes('visit') || q.includes('4 pm') || q.includes('today') || q.includes('time')) {
      return `Sure! I can visit your location around that time. Please use the 'Book Appointment' button on my profile page to lock your time slot.`;
    }
    if (q.includes('cost') || q.includes('price') || q.includes('estimate') || q.includes('charge')) {
      return `My base consultation rate is ${workerObj.pricePerHour || '₹399'}. For custom work, I can inspect the site and provide a final transparent estimate.`;
    }
    if (q.includes('location') || q.includes('address') || q.includes('reach') || q.includes('where')) {
      return `I am located in ${workerObj.area || 'Alambagh, Lucknow'}. I can reach your doorstep within 25-40 minutes after booking confirmation.`;
    }
    if (q.includes('urgent') || q.includes('emergency') || q.includes('leak') || q.includes('power')) {
      return `Understood! I treat emergency service requests with top priority. Go ahead and confirm the booking and I will dispatch immediately!`;
    }
    return `Hello! Thanks for reaching out to ${workerObj.name}. How can I assist you with your service requirements today?`;
  };

  const handleSelectContact = (workerObj) => {
    setCurrentWorker(workerObj);
    navigate(`/chat/${workerObj._id || workerObj.id}`);
  };

  // Filter contacts by active tab & search keyword
  const filteredWorkers = unifiedContactsList.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      (w.profession && w.profession.toLowerCase().includes(sidebarSearch.toLowerCase()));
    
    if (activeTab === 'providers') return matchesSearch && (w.contactType === 'provider' || !w.contactType);
    if (activeTab === 'clients') return matchesSearch && w.contactType === 'client';
    return matchesSearch;
  });

  // Filter current chat thread messages by search term
  const displayedMessages = threadSearch.trim()
    ? messages.filter(m => m.text.toLowerCase().includes(threadSearch.toLowerCase()))
    : messages;

  if (!currentWorker) {
    return (
      <div className="chat-page-wrapper">
        <Navbar />
        <main className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h3>No provider selected</h3>
          <Link to="/nearby">Browse Nearby Service Providers</Link>
        </main>
      </div>
    );
  }

  const workerAvatar = currentWorker.avatar || currentWorker.image || currentWorker.providerAvatar || defaultAvatarImg;

  return (
    <div className="chat-page-wrapper">
      <Navbar />

      <main className="chat-main-container container">
        <div className="chat-layout-grid glass">
          
          {/* Left Sidebar: Contacts List */}
          <aside className="chat-sidebar">
            <div className="sidebar-header">
              <h3>Service Chats</h3>
              <span className="active-badge">{unifiedContactsList.length} Pros</span>
            </div>

            {/* Sidebar Tabs */}
            <div className="sidebar-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'providers' ? 'active' : ''}`}
                onClick={() => setActiveTab('providers')}
              >
                Service Pros
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                Clients
              </button>
            </div>

            <div className="sidebar-search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search name or service..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
            </div>

            <div className="contacts-scroll-list">
              {filteredWorkers.map(w => {
                const isSelected = String(w.id) === String(currentWorker.id) || String(w._id) === String(currentWorker._id);
                const contactAvatar = w.avatar || w.image || w.providerAvatar || defaultAvatarImg;
                return (
                  <div
                    key={w._id || w.id}
                    className={`contact-item-row ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectContact(w)}
                  >
                    <div className="contact-avatar-wrapper">
                      <img src={contactAvatar} alt={w.name} />
                      {w.isOnline && <span className="online-indicator"></span>}
                    </div>
                    <div className="contact-info">
                      <div className="contact-name-row">
                        <span className="contact-name">{w.name}</span>
                        <span className="contact-rate">{w.pricePerHour || '₹399'}</span>
                      </div>
                      <span className="contact-subtitle">{w.profession}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Main Panel: Active Chat Thread */}
          <section className="chat-active-window">
            
            {/* Header Top Bar */}
            <div className="chat-window-header">
              <div className="worker-header-info">
                <button type="button" className="btn-back-mobile" onClick={() => navigate('/nearby')}>
                  <FiArrowLeft />
                </button>

                <div className="avatar-header-box">
                  <img src={workerAvatar} alt={currentWorker.name} />
                  <span className="online-pulse-dot"></span>
                </div>

                <div>
                  <h3 className="header-worker-name">{currentWorker.name}</h3>
                  <div className="header-meta-row">
                    <span className="pro-tag">{currentWorker.profession}</span>
                    <span className="meta-dot">•</span>
                    <span className="location-tag"><FiMapPin /> {currentWorker.area || 'Lucknow'}</span>
                    <span className="meta-dot">•</span>
                    <span className="rating-tag">⭐ {currentWorker.rating || '5.0'}</span>
                  </div>
                </div>
              </div>

              <div className="header-action-buttons">
                <button
                  type="button"
                  className={`btn-icon-circle ${showThreadSearch ? 'active' : ''}`}
                  onClick={() => setShowThreadSearch(!showThreadSearch)}
                  title="Search in conversation"
                >
                  <FiSearch />
                </button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={FiPhone}
                  onClick={() => window.location.href = `tel:${currentWorker.phone || '+91 98765 43210'}`}
                >
                  Call
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={FiCalendar}
                  onClick={() => navigate(`/worker/${currentWorker._id || currentWorker.id}`)}
                >
                  Book Service
                </Button>
              </div>
            </div>

            {/* In-Thread Search Input Bar */}
            <AnimatePresence>
              {showThreadSearch && (
                <motion.div
                  className="thread-search-bar"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder={`Search messages with ${currentWorker.name}...`}
                    value={threadSearch}
                    onChange={(e) => setThreadSearch(e.target.value)}
                    autoFocus
                  />
                  {threadSearch && (
                    <button type="button" onClick={() => setThreadSearch('')} className="clear-btn">
                      <FiX />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="chat-messages-area" ref={chatScrollContainerRef} onScroll={handleScroll}>
              {/* Privacy Trust Banner */}
              <div className="chat-trust-banner">
                <FiCheckCircle className="trust-icon" />
                <span>End-to-end encrypted connection with <strong>{currentWorker.name}</strong></span>
              </div>

              {displayedMessages.length === 0 ? (
                <div className="chat-empty-state">
                  <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                    {threadSearch ? `No messages found matching "${threadSearch}"` : `No messages yet with ${currentWorker.name}.`}
                  </p>
                  <p style={{ fontSize: '13px', marginTop: '6px' }}>Type a message below or click a quick prompt to start chatting!</p>
                </div>
              ) : (
                displayedMessages.map(msg => {
                  const isMe = user?.role === 'provider'
                    ? (msg.sender === 'provider' || msg.sender === 'worker')
                    : (msg.sender === 'user');
                  return (
                    <ChatBubble
                      key={msg.id}
                      message={msg}
                      isMe={isMe}
                      providerAvatar={workerAvatar}
                      userAvatar={user?.avatar || defaultAvatarImg}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                      onAcceptQuote={handleAcceptQuote}
                    />
                  );
                })
              )}

              {isTyping && (
                <div className="worker-typing-box">
                  <img src={workerAvatar} alt="Typing..." className="typing-avatar" />
                  <div className="typing-bubble">
                    <span className="typing-text">{currentWorker.name.split(' ')[0]} is typing</span>
                    <div className="typing-dots">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Scroll to Bottom Button */}
            {showScrollBottom && (
              <button
                type="button"
                className="btn-scroll-bottom"
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                <FiArrowDown />
              </button>
            )}

            {/* Quick Contextual Reply Chips */}
            <div className="quick-prompts-bar">
              <span className="prompts-label">Quick Prompts:</span>
              <div className="prompts-scroller">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="prompt-chip"
                    onClick={() => setInputText(p.text)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Typing Area */}
            <div className="chat-typing-container">
              {showEmojis && (
                <div className="emojis-bar glass fade-in">
                  {popularEmojis.map(emoji => (
                    <button key={emoji} type="button" onClick={() => setInputText(prev => prev + emoji)}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {attachmentPreview && (
                <div className="attachment-preview-tag">
                  <img src={attachmentPreview} alt="Preview" className="tag-img-thumb" />
                  <span>Photo Attachment Ready</span>
                  <button type="button" onClick={() => setAttachmentPreview(null)}>✕</button>
                </div>
              )}

              <form className="chat-typing-form" onSubmit={handleSend}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageFileSelect}
                />

                <button
                  type="button"
                  className={`typing-icon-btn ${showEmojis ? 'active' : ''}`}
                  onClick={() => setShowEmojis(!showEmojis)}
                  title="Insert Emoji"
                >
                  <FiSmile />
                </button>

                <button
                  type="button"
                  className="typing-icon-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Photo File"
                >
                  <FiImage />
                </button>

                <button
                  type="button"
                  className="typing-icon-btn"
                  onClick={handleShareLocation}
                  title="Share Site Location Pin"
                >
                  <FiMapPin />
                </button>

                {user?.role === 'provider' && (
                  <button
                    type="button"
                    className="typing-icon-btn"
                    onClick={handleSendQuote}
                    title="Send Custom Price Quote"
                  >
                    <FiDollarSign />
                  </button>
                )}

                <input
                  type="text"
                  placeholder={`Message ${currentWorker.name}...`}
                  value={inputText}
                  onChange={handleInputChange}
                />

                <button type="submit" className="chat-send-btn" title="Send Message">
                  <FiSend />
                </button>
              </form>
            </div>
          </section>

        </div>
      </main>

      {/* Share Location Modal */}
      {showLocationModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="modal-card glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiMapPin /> Share Current Location</h3>
              <button type="button" onClick={() => setShowLocationModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p>Attach your current GPS location to help <strong>{currentWorker.name}</strong> reach your location easily.</p>
              <div className="location-preview-box">
                <span className="loc-badge">📍 Selected Pin:</span>
                <p>Alambagh Market, Near Phoenix Mall, Lucknow, UP 226005</p>
                <small>Lat: 26.8122, Long: 80.8986</small>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setShowLocationModal(false)}>Cancel</Button>
              <Button variant="gradient" onClick={confirmShareLocation}>Attach Location Pin</Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Quote Modal */}
      {showQuoteModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowQuoteModal(false)}>
          <div className="modal-card glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiDollarSign /> Send Custom Service Quote</h3>
              <button type="button" onClick={() => setShowQuoteModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group-field">
                <label>Service / Repair Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Rewiring + Switch Fitting"
                  value={quoteFormData.title}
                  onChange={e => setQuoteFormData({ ...quoteFormData, title: e.target.value })}
                />
              </div>
              <div className="form-group-field">
                <label>Estimated Amount</label>
                <input
                  type="text"
                  placeholder="e.g. ₹899"
                  value={quoteFormData.amount}
                  onChange={e => setQuoteFormData({ ...quoteFormData, amount: e.target.value })}
                />
              </div>
              <div className="form-group-field">
                <label>Quote Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe parts, labor, and warranty details..."
                  value={quoteFormData.desc}
                  onChange={e => setQuoteFormData({ ...quoteFormData, desc: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setShowQuoteModal(false)}>Cancel</Button>
              <Button variant="gradient" onClick={confirmSendQuote}>Send Quote Card</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
