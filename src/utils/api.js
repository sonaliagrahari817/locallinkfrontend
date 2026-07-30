import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============== AUTH ==============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ============== USERS ==============
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getFavorites: () => api.get('/users/favorites'),
  addFavorite: (workerId) => api.post(`/users/favorites/${workerId}`),
  removeFavorite: (workerId) => api.delete(`/users/favorites/${workerId}`),
};

// ============== WORKERS ==============
export const workerAPI = {
  getAll: (params) => api.get('/workers', { params }),
  getById: (id) => api.get(`/workers/${id}`),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
};

// ============== SERVICES ==============
export const serviceAPI = {
  getAll: (params) => api.get('/services', { params }),
  getMyServices: () => api.get('/services/my-services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  delete: (id) => api.delete(`/services/${id}`),
};

// ============== BOOKINGS ==============
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings'),
  getProviderBookings: (workerId) => api.get('/bookings/provider', { params: { workerId } }),
  updateStatus: (id, status) => api.put(`/bookings/${id}`, { status }),
};

// ============== REVIEWS ==============
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByWorker: (workerId) => api.get(`/reviews/${workerId}`),
};

// ============== POSTS ==============
export const postAPI = {
  getAll: (params) => api.get('/posts', { params }),
  create: (data) => api.post('/posts', data),
  toggleLike: (id) => api.put(`/posts/${id}/like`),
  delete: (id) => api.delete(`/posts/${id}`),
};

// ============== CONTACT ==============
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
};

// ============== OFFERS ==============
export const offerAPI = {
  getAll: () => api.get('/offers'),
};

// ============== MESSAGES ==============
export const messageAPI = {
  getMessages: (targetId) => api.get(`/messages/${targetId}`),
  getConversations: () => api.get('/messages/conversations/all'),
  markAsRead: (targetId) => api.put(`/messages/read/${targetId}`),
  sendMessage: (data) => api.post('/messages', data),
  editMessage: (id, text) => api.put(`/messages/item/${id}`, { text }),
  deleteMessage: (id) => api.delete(`/messages/item/${id}`),
};

export default api;
