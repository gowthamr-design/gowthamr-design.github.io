import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT token if present
api.interceptors.request.use((config) => {
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
};

export default api;
