import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, contentAPI } from '../services/api';
import '../styles/admin.css';

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState('overview'); 
  // 'overview' | 'home_cms' | 'services_cms' | 'packages_cms' | 'gallery_cms' | 'events_cms' | 'content_cms' | 'bookings' | 'users' | 'admins'
  
  const [stats, setStats] = useState({
    total_bookings: 0,
    total_revenue: 0,
    upcoming_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
    total_customers: 0
  });

  const [updateMsg, setUpdateMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const showFeedback = (msg) => {
    setUpdateMsg(msg);
    setTimeout(() => setUpdateMsg(''), 3500);
  };

  const showError = (msg) => {
    setActionError(msg);
    setTimeout(() => setActionError(''), 4500);
  };

  // =========================================================================
  // 1. BOOKINGS STATE
  // =========================================================================
  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // =========================================================================
  // 2. USERS STATE
  // =========================================================================
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // =========================================================================
  // 3. ADMINS STATE
  // =========================================================================
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    role: 'ADMIN'
  });

  // =========================================================================
  // 4. SERVICES CMS STATE
  // =========================================================================
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'DECORATION',
    starting_price: 15000,
    price_unit: 'flat',
    image_url: '',
    display_order: 0,
    is_published: true
  });

  // =========================================================================
  // 5. PACKAGES CMS STATE
  // =========================================================================
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    tier_name: '',
    tier_slug: 'custom',
    badge_text: 'Popular Choice',
    starting_price: 50000,
    description: '',
    features_list: '',
    image_url: '',
    display_order: 0,
    is_published: true
  });

  // =========================================================================
  // 6. GALLERY CMS STATE
  // =========================================================================
  const [galleryItems, setGalleryItems] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [galleryFilterType, setGalleryFilterType] = useState('ALL');
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    media_type: 'image',
    src: '',
    poster_url: '',
    category: 'HIGHLIGHTS',
    caption: '',
    display_order: 0,
    is_published: true
  });

  // =========================================================================
  // 7. EVENTS SHOWCASE CMS STATE
  // =========================================================================
  const [eventsList, setEventsList] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Wedding',
    status: 'COMPLETED',
    date: '2026-03-15',
    location: 'Chennai, Tamil Nadu',
    description: '',
    image_url: '',
    total_amount: 150000,
    display_order: 0,
    is_published: true
  });

  // =========================================================================
  // 8. HOME & PAGE CONTENT CMS STATE
  // =========================================================================
  const [homeCmsData, setHomeCmsData] = useState({
    hero: {
      tag: 'Banana Brothers Events',
      title: 'Where Moments Become Memories.',
      lead: 'From thoughtful planning to grand celebrations, we bring your vision to life with seamless execution. Every detail is managed with care to create unforgettable moments.',
      primaryBtnText: 'Explore Packages',
      primaryBtnLink: '/packages',
      secondaryBtnText: 'Book Event',
      secondaryBtnLink: '/packages'
    },
    metrics: {
      events: 1200,
      satisfaction: 98,
      specialists: 50,
      experience: 15
    },
    highlights: [
      { id: 1, title: 'Luxury Weddings', desc: 'Bespoke grand mandap setups, ethereal floral canopies & regal chandeliers.' },
      { id: 2, title: 'Corporate Summits', desc: 'Panoramic staging, intelligent beam lighting & executive keynote production.' },
      { id: 3, title: 'Milestone Celebrations', desc: 'Luxe marquee illuminations & artisanal decor arrangements.' }
    ]
  });

  const [aboutCmsData, setAboutCmsData] = useState({
    story: 'Banana Brothers is South India’s premier luxury event management firm, orchestrating extraordinary celebrations.',
    mission: 'To deliver flawless, awe-inspiring experiences with unmatched aesthetic precision.',
    vision: 'To redefine global celebration benchmarks through cultural elegance and production excellence.'
  });

  const [contactCmsData, setContactCmsData] = useState({
    phone: '+91 98765 43210',
    email: 'events@bananabrothers.com',
    address: 'Grand Royale Avenue, Nungambakkam, Chennai, Tamil Nadu 600034',
    timings: 'Monday – Sunday: 9:00 AM – 9:00 PM'
  });

  const [loadingContent, setLoadingContent] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Initial Data Fetching based on Active Tab
  useEffect(() => {
    if (isAdmin) {
      loadStats();
      if (activeMainTab === 'overview') {
        loadBookings();
      } else if (activeMainTab === 'bookings') {
        loadBookings();
      } else if (activeMainTab === 'users') {
        loadUsers();
      } else if (activeMainTab === 'admins' && isSuperAdmin) {
        loadAdmins();
      } else if (activeMainTab === 'services_cms') {
        loadServices();
      } else if (activeMainTab === 'packages_cms') {
        loadPackages();
      } else if (activeMainTab === 'gallery_cms') {
        loadGallery();
      } else if (activeMainTab === 'events_cms') {
        loadEvents();
      } else if (activeMainTab === 'home_cms') {
        loadHomeContent();
      } else if (activeMainTab === 'content_cms') {
        loadOtherPagesContent();
      }
    }
  }, [isAdmin, activeMainTab, selectedStatus, isSuperAdmin, galleryFilterType]);

  // Data Fetch Handlers
  const loadStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await adminAPI.getBookings(selectedStatus, searchQuery);
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const res = await adminAPI.getAdmins();
      setAdmins(res.data);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const res = await adminAPI.getAdminServices();
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      const res = await adminAPI.getAdminPackages();
      setPackages(res.data);
    } catch (err) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadGallery = async () => {
    try {
      setLoadingGallery(true);
      const type = galleryFilterType === 'ALL' ? null : galleryFilterType;
      const res = await adminAPI.getAdminGallery(type);
      setGalleryItems(res.data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await adminAPI.getAdminEvents();
      setEventsList(res.data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadHomeContent = async () => {
    try {
      setLoadingContent(true);
      const res = await contentAPI.getContent('home');
      if (res.data) {
        setHomeCmsData(prev => ({
          hero: res.data.hero || prev.hero,
          metrics: res.data.metrics || prev.metrics,
          highlights: res.data.highlights || prev.highlights,
        }));
      }
    } catch (err) {
      console.warn('Using default home content:', err);
    } finally {
      setLoadingContent(false);
    }
  };

  const loadOtherPagesContent = async () => {
    try {
      setLoadingContent(true);
      const aboutRes = await contentAPI.getContent('about');
      if (aboutRes.data) {
        setAboutCmsData(prev => ({ ...prev, ...aboutRes.data }));
      }
      const contactRes = await contentAPI.getContent('contact');
      if (contactRes.data) {
        setContactCmsData(prev => ({ ...prev, ...contactRes.data }));
      }
    } catch (err) {
      console.warn('Using default about/contact content:', err);
    } finally {
      setLoadingContent(false);
    }
  };

  // Media Upload Helper
  const handleFileUpload = async (file, onUploadedUrl) => {
    if (!file) return;
    try {
      setUploadingMedia(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminAPI.uploadMedia(formData);
      if (res.data && res.data.url) {
        onUploadedUrl(res.data.url);
        showFeedback('Media file uploaded successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Media upload failed. Check format & size.';
      showError(msg);
    } finally {
      setUploadingMedia(false);
    }
  };

  // =========================================================================
  // SERVICES CRUD HANDLERS
  // =========================================================================
  const handleOpenServiceModal = (svc = null) => {
    if (svc) {
      setEditingService(svc);
      setServiceForm({
        name: svc.name || '',
        description: svc.description || '',
        category: svc.category || 'DECORATION',
        starting_price: svc.starting_price || 0,
        price_unit: svc.price_unit || 'flat',
        image_url: svc.image_url || '',
        display_order: svc.display_order || 0,
        is_published: svc.is_published !== false
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: '',
        description: '',
        category: 'DECORATION',
        starting_price: 15000,
        price_unit: 'flat',
        image_url: '',
        display_order: services.length + 1,
        is_published: true
      });
    }
    setShowServiceModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await adminAPI.updateService(editingService.id, serviceForm);
        showFeedback(`Service '${serviceForm.name}' updated!`);
      } else {
        await adminAPI.createService(serviceForm);
        showFeedback(`Service '${serviceForm.name}' created!`);
      }
      setShowServiceModal(false);
      loadServices();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save service.');
    }
  };

  const handleTogglePublishService = async (svc) => {
    try {
      const nextState = !svc.is_published;
      await adminAPI.togglePublishService(svc.id, nextState);
      showFeedback(`Service ${nextState ? 'published' : 'unpublished'}`);
      loadServices();
    } catch (err) {
      showError('Failed to toggle publication status.');
    }
  };

  const handleDeleteService = async (svc) => {
    if (!window.confirm(`Are you sure you want to permanently delete service "${svc.name}"?`)) return;
    try {
      await adminAPI.deleteService(svc.id);
      showFeedback(`Service '${svc.name}' deleted.`);
      loadServices();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete service.');
    }
  };

  // =========================================================================
  // PACKAGES CRUD HANDLERS
  // =========================================================================
  const handleOpenPackageModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageForm({
        tier_name: pkg.tier_name || '',
        tier_slug: pkg.tier_slug || '',
        badge_text: pkg.badge_text || '',
        starting_price: pkg.starting_price || 0,
        description: pkg.description || '',
        features_list: Array.isArray(pkg.features_list) ? pkg.features_list.join('\n') : (pkg.features_list || ''),
        image_url: pkg.image_url || '',
        display_order: pkg.display_order || 0,
        is_published: pkg.is_published !== false
      });
    } else {
      setEditingPackage(null);
      setPackageForm({
        tier_name: '',
        tier_slug: '',
        badge_text: 'Signature Package',
        starting_price: 50000,
        description: '',
        features_list: 'Grand Floral Arch\nHD Sound & Lighting\nVIP Banquet Coordination',
        image_url: '',
        display_order: packages.length + 1,
        is_published: true
      });
    }
    setShowPackageModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...packageForm,
        features_list: packageForm.features_list.split('\n').map(s => s.trim()).filter(Boolean)
      };
      if (editingPackage) {
        await adminAPI.updatePackage(editingPackage.id, payload);
        showFeedback(`Package '${packageForm.tier_name}' updated!`);
      } else {
        await adminAPI.createPackage(payload);
        showFeedback(`Package '${packageForm.tier_name}' created!`);
      }
      setShowPackageModal(false);
      loadPackages();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save package.');
    }
  };

  const handleTogglePublishPackage = async (pkg) => {
    try {
      const nextState = !pkg.is_published;
      await adminAPI.togglePublishPackage(pkg.id, nextState);
      showFeedback(`Package ${nextState ? 'published' : 'unpublished'}`);
      loadPackages();
    } catch (err) {
      showError('Failed to toggle package publication.');
    }
  };

  const handleDeletePackage = async (pkg) => {
    if (!window.confirm(`Are you sure you want to permanently delete package "${pkg.tier_name}"?`)) return;
    try {
      await adminAPI.deletePackage(pkg.id);
      showFeedback(`Package '${pkg.tier_name}' deleted.`);
      loadPackages();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete package.');
    }
  };

  // =========================================================================
  // GALLERY CRUD HANDLERS
  // =========================================================================
  const handleOpenGalleryModal = (item = null) => {
    if (item) {
      setEditingGalleryItem(item);
      setGalleryForm({
        title: item.title || '',
        media_type: item.media_type || 'image',
        src: item.src || '',
        poster_url: item.poster_url || '',
        category: item.category || 'HIGHLIGHTS',
        caption: item.caption || '',
        display_order: item.display_order || 0,
        is_published: item.is_published !== false
      });
    } else {
      setEditingGalleryItem(null);
      setGalleryForm({
        title: '',
        media_type: 'image',
        src: '',
        poster_url: '',
        category: 'HIGHLIGHTS',
        caption: '',
        display_order: galleryItems.length + 1,
        is_published: true
      });
    }
    setShowGalleryModal(true);
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    try {
      if (editingGalleryItem) {
        await adminAPI.updateGalleryItem(editingGalleryItem.id, galleryForm);
        showFeedback(`Gallery media '${galleryForm.title || 'Item'}' updated!`);
      } else {
        await adminAPI.createGalleryItem(galleryForm);
        showFeedback(`Gallery media added successfully!`);
      }
      setShowGalleryModal(false);
      loadGallery();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save gallery item.');
    }
  };

  const handleTogglePublishGallery = async (item) => {
    try {
      const nextState = !item.is_published;
      await adminAPI.togglePublishGallery(item.id, nextState);
      showFeedback(`Media item ${nextState ? 'published' : 'unpublished'}`);
      loadGallery();
    } catch (err) {
      showError('Failed to toggle gallery status.');
    }
  };

  const handleDeleteGallery = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title || 'this media item'}"?`)) return;
    try {
      await adminAPI.deleteGalleryItem(item.id);
      showFeedback(`Media deleted.`);
      loadGallery();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete media item.');
    }
  };

  // =========================================================================
  // EVENTS SHOWCASE CRUD HANDLERS
  // =========================================================================
  const handleOpenEventModal = (evt = null) => {
    if (evt) {
      setEditingEvent(evt);
      setEventForm({
        title: evt.title || '',
        category: evt.category || 'Wedding',
        status: evt.status || 'COMPLETED',
        date: evt.date || '2026-03-15',
        location: evt.location || 'Chennai, Tamil Nadu',
        description: evt.description || '',
        image_url: evt.image_url || '',
        total_amount: evt.total_amount || 100000,
        display_order: evt.display_order || 0,
        is_published: evt.is_published !== false
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '',
        category: 'Royal Wedding',
        status: 'COMPLETED',
        date: new Date().toISOString().split('T')[0],
        location: 'Chennai, Tamil Nadu',
        description: '',
        image_url: '',
        total_amount: 150000,
        display_order: eventsList.length + 1,
        is_published: true
      });
    }
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await adminAPI.updateEvent(editingEvent.id, eventForm);
        showFeedback(`Event '${eventForm.title}' updated!`);
      } else {
        await adminAPI.createEvent(eventForm);
        showFeedback(`Event '${eventForm.title}' added to showcase!`);
      }
      setShowEventModal(false);
      loadEvents();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save showcase event.');
    }
  };

  const handleTogglePublishEvent = async (evt) => {
    try {
      const nextState = !evt.is_published;
      await adminAPI.togglePublishEvent(evt.id, nextState);
      showFeedback(`Event ${nextState ? 'published' : 'unpublished'}`);
      loadEvents();
    } catch (err) {
      showError('Failed to toggle event visibility.');
    }
  };

  const handleDeleteEvent = async (evt) => {
    if (!window.confirm(`Are you sure you want to delete event "${evt.title}"?`)) return;
    try {
      await adminAPI.deleteEvent(evt.id);
      showFeedback(`Event deleted.`);
      loadEvents();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete event.');
    }
  };

  // =========================================================================
  // HOME PAGE CMS SAVE HANDLER
  // =========================================================================
  const handleSaveHomeContent = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.savePageContent('home', 'hero', homeCmsData.hero);
      await adminAPI.savePageContent('home', 'metrics', homeCmsData.metrics);
      await adminAPI.savePageContent('home', 'highlights', homeCmsData.highlights);
      showFeedback('Home Page content successfully saved to database!');
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save Home Page content.');
    }
  };

  // =========================================================================
  // ABOUT & CONTACT CMS SAVE HANDLER
  // =========================================================================
  const handleSaveAboutContent = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.savePageContent('about', 'general', aboutCmsData);
      showFeedback('About Us content saved to database!');
    } catch (err) {
      showError('Failed to save About content.');
    }
  };

  const handleSaveContactContent = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.savePageContent('contact', 'general', contactCmsData);
      showFeedback('Contact details saved to database!');
    } catch (err) {
      showError('Failed to save Contact content.');
    }
  };

  // =========================================================================
  // BOOKINGS & USERS HANDLERS (PRESERVED)
  // =========================================================================
  const handleBookingSearch = (e) => {
    e.preventDefault();
    loadBookings();
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateStatus(bookingId, newStatus);
      showFeedback(`Booking status updated to ${newStatus}`);
      loadBookings();
      loadStats();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showError('Failed to update booking status.');
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    if (!isSuperAdmin) return;
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await adminAPI.updateUserRole(targetUserId, newRole);
      showFeedback(`User role changed to ${newRole}`);
      loadUsers();
      if (isSuperAdmin) loadAdmins();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update user role.');
    }
  };

  const handleUserStatusToggle = async (targetUserId, currentIsActive) => {
    if (!isSuperAdmin) return;
    const newStatus = currentIsActive === 1 ? 0 : 1;
    const actionLabel = newStatus === 1 ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this account?`)) return;
    try {
      await adminAPI.updateUserStatus(targetUserId, newStatus);
      showFeedback(`Account ${newStatus === 1 ? 'activated' : 'deactivated'}`);
      loadUsers();
      if (isSuperAdmin) loadAdmins();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update account status.');
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createAdmin(newAdminForm);
      showFeedback(`Admin account '${newAdminForm.username}' created successfully!`);
      setNewAdminForm({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone_number: '',
        role: 'ADMIN'
      });
      loadAdmins();
      loadUsers();
      loadStats();
      setShowCreateAdminModal(false);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to create admin.');
    }
  };

  if (authLoading) {
    return (
      <div className="admin-container">
        <div className="empty-state">
          <h4>Loading Administrative Portal...</h4>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="admin-container">
        <div className="empty-state" style={{ padding: '80px 20px' }}>
          <h2 style={{ color: '#FFF4DC', marginBottom: '15px' }}>🔒 Access Restricted</h2>
          <p style={{ color: '#F0D28A', maxWidth: '500px', margin: '0 auto 25px auto' }}>
            This portal is exclusively reserved for Banana Brothers administrative personnel.
            Please sign in with administrator credentials to manage website CMS and operations.
          </p>
          <Link to="/login" className="btn-sm btn-view" style={{ padding: '10px 24px', fontSize: '1rem' }}>
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const filteredServices = services.filter(s => {
    if (!serviceSearch) return true;
    const q = serviceSearch.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-container">
      {/* Header Bar */}
      <div className="admin-header">
        <div className="admin-title-group">
          <h1>
            Banana Brothers CMS & Control Center
            <span className="admin-badge">
              {isSuperAdmin ? '👑 Super Admin Portal' : '🛡️ Admin Portal'}
            </span>
          </h1>
          <p>
            Logged in as <strong>{user?.full_name || user?.username}</strong> ({user?.role}) — Full Website Content & Operations Control
          </p>
        </div>
        
        {updateMsg && (
          <div style={{ background: 'rgba(56, 161, 105, 0.25)', border: '1px solid #D9A441', color: '#FFC400', padding: '8px 18px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
            ✓ {updateMsg}
          </div>
        )}
        {actionError && (
          <div style={{ background: 'rgba(229, 62, 62, 0.25)', border: '1px solid #E53E3E', color: '#FEB2B2', padding: '8px 18px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
            ⚠️ {actionError}
          </div>
        )}
      </div>

      {/* Main CMS Navigation Tab Bar */}
      <div className="cms-nav-scroll-wrapper" style={{ marginBottom: '24px' }}>
        <div className="cms-nav-tabs">
          <button
            className={`admin-tab-btn ${activeMainTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`admin-tab-btn ${activeMainTab === 'home_cms' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('home_cms')}
          >
            🏠 Home Page CMS
          </button>
          <button
            className={`admin-tab-btn ${activeMainTab === 'services_cms' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('services_cms')}
          >
            🛠️ Services CMS ({services.length})
          </button>
          <button
            className={`admin-tab-btn ${activeMainTab === 'packages_cms' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('packages_cms')}
          >
            📦 Packages CMS ({packages.length})
          </button>
          <button
            className={`admin-tab-btn ${activeMainTab === 'gallery_cms' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('gallery_cms')}
          >
            🖼️ Gallery CMS ({galleryItems.length})
          </button>
          <button
            className={`admin-tab-btn ${activeMainTab === 'events_cms' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('events_cms')}
          >
            🎭 Events Showcase ({eventsList.length})
          </button>
          <button
            className={`admin-tab-btn ${activeMainTab === 'content_cms' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('content_cms')}
          >
            📄 Pages Content
          </button>
          <button
            className={`admin-tab-btn ${activeMainTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('bookings')}
          >
            📋 Bookings ({bookings.length})
          </button>
          <button
            className={`admin-tab-btn ${activeMainTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('users')}
          >
            👥 User Directory
          </button>
          {isSuperAdmin && (
            <button
              className={`admin-tab-btn ${activeMainTab === 'admins' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('admins')}
            >
              👑 Admin Team ({admins.length})
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. DASHBOARD OVERVIEW TAB */}
      {/* ======================================================== */}
      {activeMainTab === 'overview' && (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total Bookings</div>
              <div className="admin-stat-value">{stats.total_bookings}</div>
            </div>
            <div className="admin-stat-card revenue">
              <div className="admin-stat-label">Gross Revenue</div>
              <div className="admin-stat-value">₹ {stats.total_revenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="admin-stat-card upcoming">
              <div className="admin-stat-label">Upcoming Events</div>
              <div className="admin-stat-value">{stats.upcoming_bookings}</div>
            </div>
            <div className="admin-stat-card customers">
              <div className="admin-stat-label">Registered Accounts</div>
              <div className="admin-stat-value">{stats.total_customers}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="cms-quick-card" onClick={() => setActiveMainTab('home_cms')}>
              <div className="cms-quick-icon">🏠</div>
              <div>
                <h4>Home Page CMS</h4>
                <p>Edit Hero title, tagline, CTAs, metrics and highlights</p>
              </div>
            </div>
            <div className="cms-quick-card" onClick={() => setActiveMainTab('services_cms')}>
              <div className="cms-quick-icon">🛠️</div>
              <div>
                <h4>Manage Services</h4>
                <p>Create, edit, reorder and publish {services.length} services</p>
              </div>
            </div>
            <div className="cms-quick-card" onClick={() => setActiveMainTab('packages_cms')}>
              <div className="cms-quick-icon">📦</div>
              <div>
                <h4>Manage Packages</h4>
                <p>Update pricing, tiers, features list and banners</p>
              </div>
            </div>
            <div className="cms-quick-card" onClick={() => setActiveMainTab('gallery_cms')}>
              <div className="cms-quick-icon">🖼️</div>
              <div>
                <h4>Manage Gallery</h4>
                <p>Upload videos, photos, manage reels and albums</p>
              </div>
            </div>
          </div>

          <div className="admin-toolbar">
            <div style={{ color: '#F0D28A', fontWeight: '700' }}>Recent Bookings Activity</div>
            <button className="btn-sm btn-view" onClick={() => setActiveMainTab('bookings')}>
              View All Bookings →
            </button>
          </div>

          <div className="admin-table-container">
            {bookings.slice(0, 5).length === 0 ? (
              <div className="empty-state"><p>No recent orders found.</p></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map(b => (
                    <tr key={b.id}>
                      <td><span className="ref-code">{b.booking_reference || `BB-${b.id}`}</span></td>
                      <td><strong>{b.full_name}</strong></td>
                      <td>{b.function_category}</td>
                      <td>{b.from_date}</td>
                      <td style={{ color: '#FFC400', fontWeight: '700' }}>₹ {(b.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`status-badge ${b.status?.toLowerCase()}`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 2. HOME PAGE CMS TAB */}
      {/* ======================================================== */}
      {activeMainTab === 'home_cms' && (
        <form onSubmit={handleSaveHomeContent}>
          <div className="cms-section-card">
            <div className="cms-section-header">
              <h3>🏠 Hero Spotlight Section</h3>
              <p>Customize the primary showcase hero copy and call-to-action buttons visible to all visitors.</p>
            </div>

            <div className="cms-form-grid">
              <div className="full-width">
                <label className="detail-label">Hero Badge Tag</label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  value={homeCmsData.hero.tag}
                  onChange={(e) => setHomeCmsData({
                    ...homeCmsData,
                    hero: { ...homeCmsData.hero, tag: e.target.value }
                  })}
                />
              </div>

              <div className="full-width">
                <label className="detail-label">Hero Main Title (Heading 1)</label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  value={homeCmsData.hero.title}
                  onChange={(e) => setHomeCmsData({
                    ...homeCmsData,
                    hero: { ...homeCmsData.hero, title: e.target.value }
                  })}
                />
              </div>

              <div className="full-width">
                <label className="detail-label">Hero Lead Description</label>
                <textarea
                  className="admin-search-input"
                  style={{ width: '100%', minHeight: '90px', borderRadius: '12px' }}
                  value={homeCmsData.hero.lead}
                  onChange={(e) => setHomeCmsData({
                    ...homeCmsData,
                    hero: { ...homeCmsData.hero, lead: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="detail-label">Primary Button Label</label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  value={homeCmsData.hero.primaryBtnText}
                  onChange={(e) => setHomeCmsData({
                    ...homeCmsData,
                    hero: { ...homeCmsData.hero, primaryBtnText: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="detail-label">Primary Button Route / URL</label>
                <input
                  type="text"
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  value={homeCmsData.hero.primaryBtnLink}
                  onChange={(e) => setHomeCmsData({
                    ...homeCmsData,
                    hero: { ...homeCmsData.hero, primaryBtnLink: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="cms-section-card">
            <div className="cms-section-header">
              <h3>📈 Home Animated Metrics Counters</h3>
              <p>Key achievements displayed with smooth numeric counter animations.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label className="detail-label">Events Managed (Count)</label>
                <input
                  type="number"
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  value={homeCmsData.metrics.events}
                  onChange={(e) => setHomeCmsData({
                    ...homeCmsData,
                    metrics: { ...homeCmsData.metrics, events: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <label className="detail-label">Client Satisfaction (%)</label>
                <input
                  type="number"
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  value={homeCmsData.metrics.satisfaction}
                  onChange={(e) => setHomeCmsData({
                    ...homeCmsData,
                    metrics: { ...homeCmsData.metrics, satisfaction: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <label className="detail-label">Event Specialists (Staff)</label>
                <input
                  type="number"
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  value={homeCmsData.metrics.specialists}
                  onChange={(e) => setHomeCmsData({
                    ...homeCmsData,
                    metrics: { ...homeCmsData.metrics, specialists: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <label className="detail-label">Years of Experience</label>
                <input
                  type="number"
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  value={homeCmsData.metrics.experience}
                  onChange={(e) => setHomeCmsData({
                    ...homeCmsData,
                    metrics: { ...homeCmsData.metrics, experience: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="submit"
              className="btn-sm"
              style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '12px 30px', fontSize: '1rem' }}
            >
              💾 Save Home Page Changes
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 3. SERVICES CMS TAB */}
      {/* ======================================================== */}
      {activeMainTab === 'services_cms' && (
        <>
          <div className="admin-toolbar">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search services by title or category..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
            />
            <button
              className="btn-sm"
              style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '9px 20px' }}
              onClick={() => handleOpenServiceModal()}
            >
              + Add New Service
            </button>
          </div>

          <div className="admin-table-container">
            {loadingServices ? (
              <div className="empty-state"><p>Loading services catalogue...</p></div>
            ) : filteredServices.length === 0 ? (
              <div className="empty-state">
                <h4>No Services Found</h4>
                <p>Click "+ Add New Service" to create your first event service.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Image</th>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Starting Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map(s => (
                    <tr key={s.id}>
                      <td><span className="ref-code">#{s.display_order ?? s.id}</span></td>
                      <td>
                        {s.image_url ? (
                          <img src={s.image_url} alt={s.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(217,164,65,0.3)' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', background: 'rgba(217,164,65,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛠️</div>
                        )}
                      </td>
                      <td>
                        <strong>{s.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#F0D28A', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.description}
                        </div>
                      </td>
                      <td><span className="status-badge upcoming">{s.category}</span></td>
                      <td style={{ color: '#FFC400', fontWeight: '700' }}>
                        ₹ {(s.starting_price || 0).toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', color: '#FFF4DC' }}>/{s.price_unit || 'flat'}</span>
                      </td>
                      <td>
                        <button
                          className={`status-badge ${s.is_published !== false ? 'completed' : 'cancelled'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => handleTogglePublishService(s)}
                          title="Click to toggle publish status"
                        >
                          {s.is_published !== false ? '● Published' : '○ Draft (Hidden)'}
                        </button>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button className="btn-sm btn-view" onClick={() => handleOpenServiceModal(s)}>Edit</button>
                          <button
                            className="btn-sm"
                            style={{ background: 'rgba(229, 62, 62, 0.25)', border: '1px solid #E53E3E', color: '#FEB2B2' }}
                            onClick={() => handleDeleteService(s)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 4. PACKAGES CMS TAB */}
      {/* ======================================================== */}
      {activeMainTab === 'packages_cms' && (
        <>
          <div className="admin-toolbar">
            <div style={{ color: '#F0D28A', fontWeight: '600' }}>
              All Event Packages ({packages.length})
            </div>
            <button
              className="btn-sm"
              style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '9px 20px' }}
              onClick={() => handleOpenPackageModal()}
            >
              + Create New Package
            </button>
          </div>

          <div className="admin-table-container">
            {loadingPackages ? (
              <div className="empty-state"><p>Loading event packages...</p></div>
            ) : packages.length === 0 ? (
              <div className="empty-state">
                <h4>No Packages Configured</h4>
                <p>Click "+ Create New Package" to add your first curated package.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Slug</th>
                    <th>Package Tier</th>
                    <th>Badge</th>
                    <th>Base Price</th>
                    <th>Features Summary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map(p => (
                    <tr key={p.id}>
                      <td><span className="ref-code">/{p.tier_slug}</span></td>
                      <td><strong>{p.tier_name}</strong></td>
                      <td><span className="status-badge upcoming">{p.badge_text || 'Standard'}</span></td>
                      <td style={{ color: '#FFC400', fontWeight: '700' }}>
                        ₹ {(p.starting_price || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', color: '#FFF4DC', maxWidth: '280px' }}>
                          {Array.isArray(p.features_list) ? p.features_list.slice(0, 2).join(', ') + '...' : p.features_list}
                        </div>
                      </td>
                      <td>
                        <button
                          className={`status-badge ${p.is_published !== false ? 'completed' : 'cancelled'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => handleTogglePublishPackage(p)}
                          title="Click to toggle publish status"
                        >
                          {p.is_published !== false ? '● Published' : '○ Draft (Hidden)'}
                        </button>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button className="btn-sm btn-view" onClick={() => handleOpenPackageModal(p)}>Edit</button>
                          <button
                            className="btn-sm"
                            style={{ background: 'rgba(229, 62, 62, 0.25)', border: '1px solid #E53E3E', color: '#FEB2B2' }}
                            onClick={() => handleDeletePackage(p)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 5. GALLERY CMS TAB */}
      {/* ======================================================== */}
      {activeMainTab === 'gallery_cms' && (
        <>
          <div className="admin-toolbar">
            <div className="admin-tabs">
              {['ALL', 'image', 'video'].map(t => (
                <button
                  key={t}
                  className={`admin-tab-btn ${galleryFilterType === t ? 'active' : ''}`}
                  onClick={() => setGalleryFilterType(t)}
                >
                  {t === 'ALL' ? 'All Media' : t === 'image' ? '📸 Photos' : '🎬 Videos / Reels'}
                </button>
              ))}
            </div>

            <button
              className="btn-sm"
              style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '9px 20px' }}
              onClick={() => handleOpenGalleryModal()}
            >
              + Upload Media
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {loadingGallery ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}><p>Loading gallery items...</p></div>
            ) : galleryItems.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <h4>No Gallery Media Found</h4>
                <p>Upload high-definition photos or reel clips to showcase your events.</p>
              </div>
            ) : (
              galleryItems.map((item) => (
                <div key={item.id} className="cms-gallery-card">
                  <div className="cms-gallery-media-preview">
                    {item.media_type === 'video' ? (
                      <video src={item.src} poster={item.poster_url || undefined} muted playsInline preload="metadata" />
                    ) : (
                      <img src={item.src} alt={item.title || 'Gallery item'} loading="lazy" />
                    )}
                    <span className="cms-media-type-badge">
                      {item.media_type === 'video' ? '🎬 Video' : '📸 Image'}
                    </span>
                  </div>
                  
                  <div className="cms-gallery-info">
                    <h4>{item.title || 'Untitled Showcase Item'}</h4>
                    <p>{item.caption || item.category || 'Highlights'}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <button
                        className={`status-badge ${item.is_published !== false ? 'completed' : 'cancelled'}`}
                        style={{ cursor: 'pointer', border: 'none', fontSize: '0.72rem' }}
                        onClick={() => handleTogglePublishGallery(item)}
                      >
                        {item.is_published !== false ? '● Live' : '○ Hidden'}
                      </button>

                      <div className="action-btn-group">
                        <button className="btn-sm btn-view" onClick={() => handleOpenGalleryModal(item)}>Edit</button>
                        <button
                          className="btn-sm"
                          style={{ background: 'rgba(229, 62, 62, 0.25)', border: '1px solid #E53E3E', color: '#FEB2B2' }}
                          onClick={() => handleDeleteGallery(item)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 6. EVENTS SHOWCASE CMS TAB */}
      {/* ======================================================== */}
      {activeMainTab === 'events_cms' && (
        <>
          <div className="admin-toolbar">
            <div style={{ color: '#F0D28A', fontWeight: '600' }}>
              Public Showcase Events ({eventsList.length})
            </div>
            <button
              className="btn-sm"
              style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '9px 20px' }}
              onClick={() => handleOpenEventModal()}
            >
              + Add Showcase Event
            </button>
          </div>

          <div className="admin-table-container">
            {loadingEvents ? (
              <div className="empty-state"><p>Loading showcase events...</p></div>
            ) : eventsList.length === 0 ? (
              <div className="empty-state">
                <h4>No Showcase Events Found</h4>
                <p>Click "+ Add Showcase Event" to add featured stories.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Event Title</th>
                    <th>Category</th>
                    <th>Date & Location</th>
                    <th>Status</th>
                    <th>Live</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsList.map(evt => (
                    <tr key={evt.id}>
                      <td>
                        {evt.image_url ? (
                          <img src={evt.image_url} alt={evt.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', background: 'rgba(217,164,65,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎭</div>
                        )}
                      </td>
                      <td>
                        <strong>{evt.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#F0D28A' }}>₹ {(evt.total_amount || 0).toLocaleString('en-IN')}</div>
                      </td>
                      <td><span className="status-badge upcoming">{evt.category}</span></td>
                      <td>
                        <div>{evt.date}</div>
                        <div style={{ fontSize: '0.78rem', color: '#F0D28A' }}>{evt.location}</div>
                      </td>
                      <td><span className="status-badge completed">{evt.status}</span></td>
                      <td>
                        <button
                          className={`status-badge ${evt.is_published !== false ? 'completed' : 'cancelled'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => handleTogglePublishEvent(evt)}
                        >
                          {evt.is_published !== false ? '● Live' : '○ Hidden'}
                        </button>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button className="btn-sm btn-view" onClick={() => handleOpenEventModal(evt)}>Edit</button>
                          <button
                            className="btn-sm"
                            style={{ background: 'rgba(229, 62, 62, 0.25)', border: '1px solid #E53E3E', color: '#FEB2B2' }}
                            onClick={() => handleDeleteEvent(evt)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 7. PAGES CONTENT CMS TAB (ABOUT & CONTACT) */}
      {/* ======================================================== */}
      {activeMainTab === 'content_cms' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* About Us CMS */}
          <form onSubmit={handleSaveAboutContent} className="cms-section-card">
            <div className="cms-section-header">
              <h3>📖 About Us Content</h3>
              <p>Configure company history, mission, and grand vision statements.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="detail-label">Brand Story & Heritage</label>
              <textarea
                className="admin-search-input"
                style={{ width: '100%', minHeight: '100px', borderRadius: '10px' }}
                value={aboutCmsData.story}
                onChange={(e) => setAboutCmsData({ ...aboutCmsData, story: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="detail-label">Our Mission Statement</label>
              <textarea
                className="admin-search-input"
                style={{ width: '100%', minHeight: '80px', borderRadius: '10px' }}
                value={aboutCmsData.mission}
                onChange={(e) => setAboutCmsData({ ...aboutCmsData, mission: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="detail-label">Our Future Vision</label>
              <textarea
                className="admin-search-input"
                style={{ width: '100%', minHeight: '80px', borderRadius: '10px' }}
                value={aboutCmsData.vision}
                onChange={(e) => setAboutCmsData({ ...aboutCmsData, vision: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn-sm"
              style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '10px 24px' }}
            >
              💾 Save About Content
            </button>
          </form>

          {/* Contact Details CMS */}
          <form onSubmit={handleSaveContactContent} className="cms-section-card">
            <div className="cms-section-header">
              <h3>📞 Official Contact & Concierge</h3>
              <p>Direct communication channels, corporate address and operating hours.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="detail-label">Direct Phone Hotline</label>
              <input
                type="text"
                className="admin-search-input"
                style={{ width: '100%' }}
                value={contactCmsData.phone}
                onChange={(e) => setContactCmsData({ ...contactCmsData, phone: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="detail-label">Official Support Email</label>
              <input
                type="email"
                className="admin-search-input"
                style={{ width: '100%' }}
                value={contactCmsData.email}
                onChange={(e) => setContactCmsData({ ...contactCmsData, email: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="detail-label">Corporate Office Address</label>
              <textarea
                className="admin-search-input"
                style={{ width: '100%', minHeight: '75px', borderRadius: '10px' }}
                value={contactCmsData.address}
                onChange={(e) => setContactCmsData({ ...contactCmsData, address: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="detail-label">Concierge Office Timings</label>
              <input
                type="text"
                className="admin-search-input"
                style={{ width: '100%' }}
                value={contactCmsData.timings}
                onChange={(e) => setContactCmsData({ ...contactCmsData, timings: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn-sm"
              style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '10px 24px' }}
            >
              💾 Save Contact Details
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. BOOKINGS MANAGEMENT TAB (PRESERVED) */}
      {/* ======================================================== */}
      {activeMainTab === 'bookings' && (
        <>
          <div className="admin-toolbar">
            <div className="admin-tabs">
              {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
                <button
                  key={tab}
                  className={`admin-tab-btn ${selectedStatus === tab ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(tab)}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <form onSubmit={handleBookingSearch} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search by ref, customer, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-sm btn-view">Search</button>
            </form>
          </div>

          <div className="admin-table-container">
            {loadingBookings ? (
              <div className="empty-state"><p>Loading bookings data...</p></div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <h4>No Bookings Found</h4>
                <p>No orders matched your current filter criteria.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking Ref</th>
                    <th>Customer & Contact</th>
                    <th>Function Type</th>
                    <th>District / Location</th>
                    <th>Schedule Date</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td><span className="ref-code">{b.booking_reference || `BB-2026-${b.id}`}</span></td>
                      <td>
                        <strong>{b.full_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#F0D28A' }}>{b.mobile_no}</div>
                      </td>
                      <td>
                        <div>{b.function_category || 'Custom Event'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#F0D28A' }}>
                          {b.package_tier ? `${b.package_tier.toUpperCase()} Tier` : 'Standard'}
                        </div>
                      </td>
                      <td>
                        <div>{b.district}</div>
                        <div style={{ fontSize: '0.78rem', color: '#F0D28A' }}>{b.place_area}</div>
                      </td>
                      <td>
                        <div>{b.from_date}</div>
                        {b.duration_days > 1 && (
                          <div style={{ fontSize: '0.78rem', color: '#FFC400' }}>
                            {b.duration_days} Days (to {b.to_date})
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: '700', color: '#FFC400' }}>
                        ₹ {(b.total_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        >
                          <option value="UPCOMING">UPCOMING</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button className="btn-sm btn-view" onClick={() => setSelectedBooking(b)}>Inspect</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 9. USER DIRECTORY & ROLES TAB (PRESERVED) */}
      {/* ======================================================== */}
      {activeMainTab === 'users' && (
        <>
          <div className="admin-toolbar">
            <div style={{ color: '#F0D28A', fontWeight: '600' }}>
              Total Users: {users.length}
            </div>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Filter by name, email, or role..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-table-container">
            {loadingUsers ? (
              <div className="empty-state"><p>Loading user directory...</p></div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <h4>No Users Found</h4>
                <p>No registered accounts match your search filter.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Account Info</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Account Status</th>
                    {isSuperAdmin && <th>Super Admin Controls</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td><span className="ref-code">#{u.id}</span></td>
                      <td>
                        <strong>{u.full_name || u.username}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#F0D28A' }}>@{u.username}</div>
                        <div style={{ fontSize: '0.8rem', color: '#FFF4DC' }}>{u.email}</div>
                      </td>
                      <td>{u.phone_number || '—'}</td>
                      <td>
                        {isSuperAdmin ? (
                          <select
                            className="status-select"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          </select>
                        ) : (
                          <span className={`status-badge ${u.role === 'SUPER_ADMIN' ? 'completed' : u.role === 'ADMIN' ? 'upcoming' : 'cancelled'}`}>
                            {u.role === 'SUPER_ADMIN' ? '👑 SUPER ADMIN' : u.role === 'ADMIN' ? '🛡️ ADMIN' : 'USER'}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${u.is_active === 1 ? 'completed' : 'cancelled'}`}>
                          {u.is_active === 1 ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td>
                          <button
                            className="btn-sm"
                            style={{
                              background: u.is_active === 1 ? 'rgba(229, 62, 62, 0.25)' : 'rgba(56, 161, 105, 0.25)',
                              border: `1px solid ${u.is_active === 1 ? '#E53E3E' : '#38A169'}`,
                              color: u.is_active === 1 ? '#FEB2B2' : '#9AE6B4'
                            }}
                            onClick={() => handleUserStatusToggle(u.id, u.is_active)}
                          >
                            {u.is_active === 1 ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 10. ADMIN TEAM & PERMISSIONS TAB (SUPER ADMIN ONLY) */}
      {/* ======================================================== */}
      {activeMainTab === 'admins' && isSuperAdmin && (
        <>
          <div className="admin-toolbar">
            <div style={{ color: '#F0D28A', fontWeight: '600' }}>
              Authorized Administrators & Super Admins ({admins.length})
            </div>
            <button
              className="btn-sm btn-view"
              style={{ padding: '8px 18px', background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800' }}
              onClick={() => setShowCreateAdminModal(true)}
            >
              + Create New Admin
            </button>
          </div>

          <div className="admin-table-container">
            {loadingAdmins ? (
              <div className="empty-state"><p>Loading admin directory...</p></div>
            ) : admins.length === 0 ? (
              <div className="empty-state">
                <h4>No Administrators Found</h4>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Admin Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id}>
                      <td><span className="ref-code">#{a.id}</span></td>
                      <td>
                        <strong>{a.full_name || a.username}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#F0D28A' }}>@{a.username}</div>
                      </td>
                      <td>{a.email}</td>
                      <td>{a.phone_number || '—'}</td>
                      <td>
                        <select
                          className="status-select"
                          value={a.role}
                          onChange={(e) => handleRoleChange(a.id, e.target.value)}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="USER">DEMOTE TO USER</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${a.is_active === 1 ? 'completed' : 'cancelled'}`}>
                          {a.is_active === 1 ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-sm"
                          style={{
                            background: a.is_active === 1 ? 'rgba(229, 62, 62, 0.25)' : 'rgba(56, 161, 105, 0.25)',
                            border: `1px solid ${a.is_active === 1 ? '#E53E3E' : '#38A169'}`,
                            color: a.is_active === 1 ? '#FEB2B2' : '#9AE6B4'
                          }}
                          onClick={() => handleUserStatusToggle(a.id, a.is_active)}
                        >
                          {a.is_active === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* =========================================================================
          MODALS & OVERLAYS
          ========================================================================= */}

      {/* 1. SERVICE ADD / EDIT MODAL */}
      {showServiceModal && (
        <div className="admin-modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="admin-modal-header">
              <h3>{editingService ? '🛠️ Edit Service' : '🛠️ Add New Service'}</h3>
              <button className="modal-close-btn" onClick={() => setShowServiceModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleSaveService}>
                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Service Title *</label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ width: '100%' }}
                    required
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="detail-label">Category</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="detail-label">Starting Price (₹)</label>
                    <input
                      type="number"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      required
                      value={serviceForm.starting_price}
                      onChange={(e) => setServiceForm({ ...serviceForm, starting_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Description</label>
                  <textarea
                    className="admin-search-input"
                    style={{ width: '100%', minHeight: '80px', borderRadius: '10px' }}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  />
                </div>

                {/* Media Upload / URL */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Service Image (Upload or URL)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ flex: 1 }}
                      placeholder="e.g. /f214bc94-72b6.png or https://..."
                      value={serviceForm.image_url}
                      onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })}
                    />
                    <label className="btn-sm btn-view" style={{ cursor: 'pointer', padding: '9px 14px' }}>
                      {uploadingMedia ? 'Uploading...' : '📁 Upload File'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files[0], (url) => setServiceForm({ ...serviceForm, image_url: url }))}
                      />
                    </label>
                  </div>
                  {serviceForm.image_url && (
                    <img src={serviceForm.image_url} alt="Preview" style={{ height: '70px', borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF4DC', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={serviceForm.is_published}
                      onChange={(e) => setServiceForm({ ...serviceForm, is_published: e.target.checked })}
                    />
                    Publish live immediately
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn-sm btn-view" onClick={() => setShowServiceModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm" style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '9px 24px' }}>
                    {editingService ? 'Save Changes' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. PACKAGE ADD / EDIT MODAL */}
      {showPackageModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPackageModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="admin-modal-header">
              <h3>{editingPackage ? '📦 Edit Package' : '📦 Create New Package'}</h3>
              <button className="modal-close-btn" onClick={() => setShowPackageModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleSavePackage}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="detail-label">Package Tier Name *</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      required
                      value={packageForm.tier_name}
                      onChange={(e) => setPackageForm({ ...packageForm, tier_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="detail-label">Slug (low / medium / high) *</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      required
                      value={packageForm.tier_slug}
                      onChange={(e) => setPackageForm({ ...packageForm, tier_slug: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="detail-label">Badge Text</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      value={packageForm.badge_text}
                      onChange={(e) => setPackageForm({ ...packageForm, badge_text: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="detail-label">Starting Price (₹) *</label>
                    <input
                      type="number"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      required
                      value={packageForm.starting_price}
                      onChange={(e) => setPackageForm({ ...packageForm, starting_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Features Included (One per line)</label>
                  <textarea
                    className="admin-search-input"
                    style={{ width: '100%', minHeight: '90px', borderRadius: '10px' }}
                    value={packageForm.features_list}
                    onChange={(e) => setPackageForm({ ...packageForm, features_list: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Package Banner Image</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ flex: 1 }}
                      placeholder="Image URL or upload..."
                      value={packageForm.image_url}
                      onChange={(e) => setPackageForm({ ...packageForm, image_url: e.target.value })}
                    />
                    <label className="btn-sm btn-view" style={{ cursor: 'pointer', padding: '9px 14px' }}>
                      📁 Upload
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files[0], (url) => setPackageForm({ ...packageForm, image_url: url }))}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF4DC', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={packageForm.is_published}
                      onChange={(e) => setPackageForm({ ...packageForm, is_published: e.target.checked })}
                    />
                    Publish live immediately
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn-sm btn-view" onClick={() => setShowPackageModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm" style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '9px 24px' }}>
                    {editingPackage ? 'Save Changes' : 'Create Package'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. GALLERY MEDIA UPLOAD / EDIT MODAL */}
      {showGalleryModal && (
        <div className="admin-modal-overlay" onClick={() => setShowGalleryModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="admin-modal-header">
              <h3>{editingGalleryItem ? '🖼️ Edit Gallery Media' : '🖼️ Upload Gallery Media'}</h3>
              <button className="modal-close-btn" onClick={() => setShowGalleryModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleSaveGallery}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="detail-label">Title</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. Royal Stage Highlights"
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="detail-label">Media Type *</label>
                    <select
                      className="status-select"
                      style={{ width: '100%', padding: '9px 12px' }}
                      value={galleryForm.media_type}
                      onChange={(e) => setGalleryForm({ ...galleryForm, media_type: e.target.value })}
                    >
                      <option value="image">📸 Image (Photo / WebP / PNG)</option>
                      <option value="video">🎬 Video (MP4 / WebM Reel)</option>
                    </select>
                  </div>
                </div>

                {/* Media Upload and Direct URL */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Media Source URL or File Upload *</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ flex: 1 }}
                      required
                      placeholder="e.g. /videos/reel-wedding-highlights.mp4 or /bg.png"
                      value={galleryForm.src}
                      onChange={(e) => setGalleryForm({ ...galleryForm, src: e.target.value })}
                    />
                    <label className="btn-sm btn-view" style={{ cursor: 'pointer', padding: '9px 14px' }}>
                      {uploadingMedia ? 'Uploading...' : '📁 Upload File'}
                      <input
                        type="file"
                        accept={galleryForm.media_type === 'video' ? 'video/*' : 'image/*'}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files[0], (url) => setGalleryForm({ ...galleryForm, src: url }))}
                      />
                    </label>
                  </div>

                  {galleryForm.src && (
                    <div style={{ marginTop: '10px' }}>
                      {galleryForm.media_type === 'video' ? (
                        <video src={galleryForm.src} controls style={{ maxHeight: '140px', borderRadius: '8px' }} />
                      ) : (
                        <img src={galleryForm.src} alt="Preview" style={{ maxHeight: '140px', borderRadius: '8px', objectFit: 'cover' }} />
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="detail-label">Category</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. WEDDING / HIGHLIGHTS / REEL"
                      value={galleryForm.category}
                      onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="detail-label">Display Order</label>
                    <input
                      type="number"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      value={galleryForm.display_order}
                      onChange={(e) => setGalleryForm({ ...galleryForm, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF4DC', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={galleryForm.is_published}
                      onChange={(e) => setGalleryForm({ ...galleryForm, is_published: e.target.checked })}
                    />
                    Publish live immediately
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn-sm btn-view" onClick={() => setShowGalleryModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm" style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '9px 24px' }}>
                    {editingGalleryItem ? 'Save Changes' : 'Add to Gallery'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. SHOWCASE EVENT ADD / EDIT MODAL */}
      {showEventModal && (
        <div className="admin-modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="admin-modal-header">
              <h3>{editingEvent ? '🎭 Edit Showcase Event' : '🎭 Add Showcase Event'}</h3>
              <button className="modal-close-btn" onClick={() => setShowEventModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleSaveEvent}>
                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Event Title *</label>
                  <input
                    type="text"
                    className="admin-search-input"
                    style={{ width: '100%' }}
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="detail-label">Category</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="detail-label">Execution Date</label>
                    <input
                      type="date"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="detail-label">Location / City</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="detail-label">Budget / Total Value (₹)</label>
                    <input
                      type="number"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      value={eventForm.total_amount}
                      onChange={(e) => setEventForm({ ...eventForm, total_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Description / Highlight Story</label>
                  <textarea
                    className="admin-search-input"
                    style={{ width: '100%', minHeight: '80px', borderRadius: '10px' }}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Event Showcase Image</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ flex: 1 }}
                      placeholder="Image URL or upload..."
                      value={eventForm.image_url}
                      onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                    />
                    <label className="btn-sm btn-view" style={{ cursor: 'pointer', padding: '9px 14px' }}>
                      📁 Upload
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files[0], (url) => setEventForm({ ...eventForm, image_url: url }))}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF4DC', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={eventForm.is_published}
                      onChange={(e) => setEventForm({ ...eventForm, is_published: e.target.checked })}
                    />
                    Publish live in stories
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn-sm btn-view" onClick={() => setShowEventModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm" style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '9px 24px' }}>
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. CREATE ADMIN MODAL (SUPER_ADMIN ONLY) */}
      {showCreateAdminModal && isSuperAdmin && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateAdminModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header">
              <h3>👑 Provision New Administrator Account</h3>
              <button className="modal-close-btn" onClick={() => setShowCreateAdminModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleCreateAdminSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="detail-label">Username *</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      required
                      value={newAdminForm.username}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="detail-label">Role Level *</label>
                    <select
                      className="status-select"
                      style={{ width: '100%', padding: '9px 14px' }}
                      value={newAdminForm.role}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value })}
                    >
                      <option value="ADMIN">ADMIN (Operations)</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Full Access)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Official Email Address *</label>
                  <input
                    type="email"
                    className="admin-search-input"
                    style={{ width: '100%' }}
                    required
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="detail-label">Password *</label>
                  <input
                    type="password"
                    className="admin-search-input"
                    style={{ width: '100%' }}
                    required
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label className="detail-label">Full Name</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      value={newAdminForm.full_name}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="detail-label">Mobile Phone</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: '100%' }}
                      value={newAdminForm.phone_number}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, phone_number: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn-sm btn-view" onClick={() => setShowCreateAdminModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm" style={{ background: 'var(--gold-pill-gradient)', color: '#0D0306', fontWeight: '800', padding: '8px 22px' }}>
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. BOOKING DETAILS INSPECTION MODAL */}
      {selectedBooking && (
        <div className="admin-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                Booking Details — <span className="ref-code">{selectedBooking.booking_reference}</span>
              </h3>
              <button className="modal-close-btn" onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Customer Name</div>
                  <div className="detail-val">{selectedBooking.full_name}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Contact Mobile</div>
                  <div className="detail-val">
                    {selectedBooking.mobile_no}
                    {selectedBooking.alt_mobile_no && ` / ${selectedBooking.alt_mobile_no}`}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Customer Email</div>
                  <div className="detail-val">{selectedBooking.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Package Tier</div>
                  <div className="detail-val">
                    {selectedBooking.package_tier ? selectedBooking.package_tier.toUpperCase() : 'STANDARD'}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Function Category</div>
                  <div className="detail-val">{selectedBooking.function_category}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Duration & Timing</div>
                  <div className="detail-val">
                    {selectedBooking.from_date} ({selectedBooking.from_time || 'Start'}) to {selectedBooking.to_date} ({selectedBooking.to_time || 'End'}) — {selectedBooking.duration_days} Day(s)
                  </div>
                </div>
                <div className="detail-item full-width">
                  <div className="detail-label">Selected Add-On Services</div>
                  <div className="detail-val">{selectedBooking.selected_needs || 'Standard Package Inclusions'}</div>
                </div>
                <div className="detail-item full-width">
                  <div className="detail-label">Venue Hall & Address</div>
                  <div className="detail-val">
                    {selectedBooking.full_address}, {selectedBooking.place_area}, {selectedBooking.district} - {selectedBooking.pincode}
                  </div>
                </div>
                {selectedBooking.map_location_url && (
                  <div className="detail-item full-width">
                    <div className="detail-label">Google Maps Geolocation Pin</div>
                    <div className="detail-val">
                      <a href={selectedBooking.map_location_url} target="_blank" rel="noopener noreferrer">
                        Open Venue Location in Google Maps ↗
                      </a>
                    </div>
                  </div>
                )}
                <div className="detail-item">
                  <div className="detail-label">Total Booking Amount</div>
                  <div className="detail-val" style={{ color: '#FFC400', fontSize: '1.2rem', fontWeight: '700' }}>
                    ₹ {(selectedBooking.total_amount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Current Status</div>
                  <div className="detail-val">
                    <span className={`status-badge ${selectedBooking.status?.toLowerCase()}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button
                  className="btn-sm btn-view"
                  style={{ padding: '8px 18px' }}
                  onClick={() => setSelectedBooking(null)}
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
