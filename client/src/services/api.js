import axios from 'axios';

const PRODUCTION_BACKEND_URL = 'https://banana-brothers-api.onrender.com/api/v1';

export const formatBaseUrl = (url) => {
  if (!url || !url.trim()) return '';
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api/v1') && (clean.startsWith('http://') || clean.startsWith('https://'))) {
    clean = `${clean}/api/v1`;
  }
  return clean;
};

export const resolveApiBaseUrl = () => {
  // 1. Explicit window or localStorage override (useful for custom domains or staging)
  if (typeof window !== 'undefined') {
    const override = window.VITE_API_BASE_URL || localStorage.getItem('bb_api_base_url');
    if (override && override.trim()) {
      return formatBaseUrl(override);
    }
  }

  // 2. Build-time environment variable if configured to an absolute backend URL
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() && envUrl !== '/api/v1') {
    return formatBaseUrl(envUrl);
  }

  // 3. Runtime domain check: if loaded on GitHub Pages or any non-localhost host
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname.toLowerCase();
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '';
    if (!isLocalhost) {
      return PRODUCTION_BACKEND_URL;
    }
  }

  // 4. Default for local development (proxied by Vite to http://localhost:8000)
  return formatBaseUrl(envUrl) || '/api/v1';
};

export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Resolves static or uploaded media URLs.
 * If the path starts with /uploads/ and we are on production, points to backend origin.
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    const base = resolveApiBaseUrl();
    if (base.startsWith('http://') || base.startsWith('https://')) {
      try {
        const origin = new URL(base).origin;
        return `${origin}${url}`;
      } catch {
        return url;
      }
    }
  }
  return url;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to dynamically attach baseURL and JWT token
api.interceptors.request.use((config) => {
  if (!config.baseURL || config.baseURL === '/api/v1') {
    config.baseURL = resolveApiBaseUrl();
  }
  const token = localStorage.getItem('bb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

export const catalogAPI = {
  getServices: (category, query) => {
    let url = '/services';
    const params = new URLSearchParams();
    if (category && category !== 'All Services') params.append('category', category);
    if (query) params.append('q', query);
    const queryString = params.toString();
    return api.get(queryString ? `${url}?${queryString}` : url);
  },
  getPackages: () => api.get('/packages'),
  getPackageBySlug: (slug) => api.get(`/packages/${slug}`),
};

export const galleryAPI = {
  getGallery: (media_type, category) => {
    let url = '/gallery';
    const params = new URLSearchParams();
    if (media_type) params.append('media_type', media_type);
    if (category && category !== 'ALL') params.append('category', category);
    const qs = params.toString();
    return api.get(qs ? `${url}?${qs}` : url);
  },
};

export const contentAPI = {
  getContent: (page_key) => api.get(`/content/${page_key}`),
};

export const bookingAPI = {
  calculate: (data) => api.post('/bookings/calculate', data),
  create: (data) => api.post('/bookings', data),
  getBooking: (idOrRef) => api.get(`/bookings/${idOrRef}`),
  getMyEvents: () => api.get('/events/my-events'),
  cancelBooking: (idOrRef) => api.post(`/bookings/${idOrRef}/cancel`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getBookings: (status, query) => {
    let url = '/admin/bookings';
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (query) params.append('q', query);
    const queryString = params.toString();
    return api.get(queryString ? `${url}?${queryString}` : url);
  },
  getBookingDetail: (id) => api.get(`/admin/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/bookings/${id}/status`, { status }),
  getUsers: () => api.get('/admin/users'),
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data) => api.post('/admin/create-admin', data),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  updateUserStatus: (userId, isActive) => api.patch(`/admin/users/${userId}/status`, { is_active: isActive }),

  // Media Upload
  uploadMedia: (formData) => api.post('/admin/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Services CMS
  getAdminServices: () => api.get('/admin/services'),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  togglePublishService: (id, is_published) => api.patch(`/admin/services/${id}/publish`, { is_published }),
  deleteService: (id) => api.delete(`/admin/services/${id}`),

  // Packages CMS
  getAdminPackages: () => api.get('/admin/packages'),
  createPackage: (data) => api.post('/admin/packages', data),
  updatePackage: (id, data) => api.put(`/admin/packages/${id}`, data),
  togglePublishPackage: (id, is_published) => api.patch(`/admin/packages/${id}/publish`, { is_published }),
  deletePackage: (id) => api.delete(`/admin/packages/${id}`),

  // Gallery CMS
  getAdminGallery: (media_type, category) => {
    let url = '/admin/gallery';
    const params = new URLSearchParams();
    if (media_type) params.append('media_type', media_type);
    if (category && category !== 'ALL') params.append('category', category);
    const qs = params.toString();
    return api.get(qs ? `${url}?${qs}` : url);
  },
  createGalleryItem: (data) => api.post('/admin/gallery', data),
  updateGalleryItem: (id, data) => api.put(`/admin/gallery/${id}`, data),
  togglePublishGallery: (id, is_published) => api.patch(`/admin/gallery/${id}/publish`, { is_published }),
  reorderGallery: (item_ids) => api.post('/admin/gallery/reorder', { item_ids }),
  deleteGalleryItem: (id) => api.delete(`/admin/gallery/${id}`),

  // Events Showcase CMS
  getAdminEvents: () => api.get('/admin/events'),
  createEvent: (data) => api.post('/admin/events', data),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  togglePublishEvent: (id, is_published) => api.patch(`/admin/events/${id}/publish`, { is_published }),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),

  // Page Content CMS
  getPageContent: (page_key) => api.get(`/admin/content/${page_key}`),
  savePageContent: (page_key, section_key, content_json) => api.put(`/admin/content/${page_key}`, {
    page_key,
    section_key,
    content_json
  }),
  deletePageContent: (page_key, section_key) => api.delete(`/admin/content/${page_key}/${section_key}`),
};

export default api;
