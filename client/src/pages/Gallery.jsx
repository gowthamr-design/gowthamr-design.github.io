import React, { useState, useEffect, useRef } from 'react';
import { galleryAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/gallery.css';

// All fallback image assets available in client/public
const defaultGalleryImages = [
  { id: 1, type: 'image', media_type: 'image', src: '/f214bc94-72b6-4202-9a01-2cece637fc3d.png', title: 'Royal Stage', category: 'Weddings', display_order: 1, is_published: 1 },
  { id: 2, type: 'image', media_type: 'image', src: '/f7cabbcd-e205-4b02-9924-97ccfe667442.png', title: 'Grand Banquet', category: 'Decor', display_order: 2, is_published: 1 },
  { id: 3, type: 'image', media_type: 'image', src: '/bg.png', title: 'Luxury Atmosphere', category: 'Highlights', display_order: 3, is_published: 1 },
  { id: 4, type: 'image', media_type: 'image', src: '/bg1.png', title: 'Celebration Arena', category: 'Weddings', display_order: 4, is_published: 1 },
  { id: 5, type: 'image', media_type: 'image', src: '/bg_blue.png', title: 'Sapphire Illuminations', category: 'Corporate', display_order: 5, is_published: 1 },
  { id: 6, type: 'image', media_type: 'image', src: '/videos/571166326_18053531924313917_6459894921198886133_n.webp', title: 'Signature Moments', category: 'Celebrations', display_order: 6, is_published: 1 },
  { id: 7, type: 'image', media_type: 'image', src: '/BB_Logo.jpg', title: 'Banana Brothers Signature', category: 'Highlights', display_order: 7, is_published: 1 },
  { id: 8, type: 'image', media_type: 'image', src: '/BB_Logo2.jpg', title: 'Banana Brothers Crown', category: 'Highlights', display_order: 8, is_published: 1 },
  { id: 9, type: 'image', media_type: 'image', src: '/BB_Logo3.jpg', title: 'Banana Brothers Emblem', category: 'Highlights', display_order: 9, is_published: 1 },
];

// All fallback video assets available in client/public/videos
const defaultGalleryVideos = [
  { id: 10, type: 'video', media_type: 'video', src: '/videos/reel-wedding-highlights.mp4', poster_url: '/bg1.png', title: 'Wedding Highlights', category: 'Reels', display_order: 10, is_published: 1 },
  { id: 11, type: 'video', media_type: 'video', src: '/videos/reel-grand-entry.mp4', poster_url: '/bg.png', title: 'Grand Entry', category: 'Reels', display_order: 11, is_published: 1 },
  { id: 12, type: 'video', media_type: 'video', src: '/videos/reel-celebration-event.mp4', poster_url: '/bg_blue.png', title: 'Celebration Event', category: 'Reels', display_order: 12, is_published: 1 },
  { id: 13, type: 'video', media_type: 'video', src: '/videos/reel-chenda-cultural.mp4', poster_url: '/bg1.png', title: 'Chenda Cultural', category: 'Cultural', display_order: 13, is_published: 1 },
  { id: 14, type: 'video', media_type: 'video', src: '/videos/reel-stage-concert.mp4', poster_url: '/bg.png', title: 'Stage Concert', category: 'Concerts', display_order: 14, is_published: 1 },
  { id: 15, type: 'video', media_type: 'video', src: '/videos/reel-badaga-tradition.mp4', poster_url: '/bg1.png', title: 'Badaga Tradition', category: 'Cultural', display_order: 15, is_published: 1 },
  { id: 16, type: 'video', media_type: 'video', src: '/videos/reel-dj-lights.mp4', poster_url: '/bg_blue.png', title: 'DJ & Lights', category: 'DJ & Music', display_order: 16, is_published: 1 },
  { id: 17, type: 'video', media_type: 'video', src: '/videos/reel-candid-entry.mp4', poster_url: '/bg.png', title: 'Candid Entry', category: 'Highlights', display_order: 17, is_published: 1 },
  { id: 18, type: 'video', media_type: 'video', src: '/videos/reel-reception-decor.mp4', poster_url: '/bg1.png', title: 'Reception Decor', category: 'Decor', display_order: 18, is_published: 1 },
  { id: 19, type: 'video', media_type: 'video', src: '/videos/reel-short-teaser.mp4', poster_url: '/bg_blue.png', title: 'Short Teaser', category: 'Reels', display_order: 19, is_published: 1 },
];

const defaultAllItems = [...defaultGalleryImages, ...defaultGalleryVideos];

const CATEGORIES = [
  'ALL',
  'Weddings',
  'Decor',
  'Highlights',
  'Corporate',
  'Celebrations',
  'Cultural',
  'Concerts',
  'DJ & Music',
  'Reels'
];

const getAnimDirectionClass = (index) => {
  const directions = [
    'gallery-card-anim-left',
    'gallery-card-anim-top',
    'gallery-card-anim-right',
    'gallery-card-anim-bottom',
    'gallery-card-anim-scale'
  ];
  return directions[index % directions.length];
};

const getFloatClass = (index) => {
  if (index === 1 || index === 7 || index === 13) return 'anim-float-1';
  if (index === 4 || index === 10 || index === 16) return 'anim-float-2';
  return '';
};

export default function Gallery() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [items, setItems] = useState(defaultAllItems);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const videoRefs = useRef({});

  // Direct Content Management (Admin Modal) State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formValues, setFormValues] = useState({
    title: '',
    media_type: 'image',
    src: '',
    poster_url: '',
    category: 'Highlights',
    caption: '',
    display_order: 0,
    is_published: 1
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Fetch gallery items from backend (Admin sees all items, normal users see only published)
  const loadGallery = async () => {
    setLoading(true);
    try {
      let res;
      if (isAdmin || isSuperAdmin) {
        res = await adminAPI.getAdminGallery();
      } else {
        res = await galleryAPI.getGallery();
      }

      if (res && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map((item) => ({
          ...item,
          type: item.media_type || 'image',
        }));
        setItems(normalized);
      } else {
        setItems(defaultAllItems);
      }
    } catch (err) {
      console.warn('Using default gallery assets:', err);
      setItems(defaultAllItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, [isAdmin, isSuperAdmin]);

  // Filter items for display
  const displayedItems = items.filter((item) => {
    // Normal visitors only see published items
    if (!isAdmin && !isSuperAdmin && item.is_published === 0) {
      return false;
    }
    // Type filter
    if (filterType !== 'ALL' && item.media_type !== filterType) {
      return false;
    }
    // Category filter
    if (filterCategory !== 'ALL' && (!item.category || item.category.toLowerCase() !== filterCategory.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Lightbox handlers
  const openLightbox = (index) => {
    Object.values(videoRefs.current).forEach((v) => {
      if (v) v.pause();
    });
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % displayedItems.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + displayedItems.length) % displayedItems.length);
  };

  // Autoplay visible inline muted videos
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && !lightboxOpen) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = Object.values(videoRefs.current).filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [lightboxOpen, displayedItems]);

  // Card entrance GPU observer
  useEffect(() => {
    const cardElements = document.querySelectorAll('.gallery-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '40px 0px 0px 0px' }
    );

    cardElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [displayedItems]);

  // Lightbox keyboard controls
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') nextLightbox();
      else if (e.key === 'ArrowLeft') prevLightbox();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, displayedItems.length]);

  // =========================================================================
  // ADMIN DIRECT CMS ACTIONS
  // =========================================================================

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormValues({
      title: '',
      media_type: 'image',
      src: '',
      poster_url: '',
      category: 'Highlights',
      caption: '',
      display_order: items.length + 1,
      is_published: 1
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormValues({
      title: item.title || '',
      media_type: item.media_type || 'image',
      src: item.src || '',
      poster_url: item.poster_url || '',
      category: item.category || 'Highlights',
      caption: item.caption || '',
      display_order: item.display_order || 0,
      is_published: item.is_published !== undefined ? item.is_published : 1
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await adminAPI.uploadMedia(formData);
      if (res.data && res.data.url) {
        setFormValues((prev) => ({
          ...prev,
          src: res.data.url,
          media_type: res.data.media_type || prev.media_type
        }));
        showToast('Media uploaded to server successfully!');
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Upload failed. Please check file format and size.';
      alert(`Upload Error: ${detail}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formValues.src.trim()) {
      alert('Please upload a media file or provide a valid media URL / source path.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formValues.title.trim() || 'Untitled Media',
        media_type: formValues.media_type,
        src: formValues.src.trim(),
        poster_url: formValues.poster_url?.trim() || undefined,
        category: formValues.category?.trim() || 'Highlights',
        caption: formValues.caption?.trim() || undefined,
        display_order: parseInt(formValues.display_order) || 0,
        is_published: formValues.is_published ? 1 : 0
      };

      if (editingItem && editingItem.id) {
        const res = await adminAPI.updateGalleryItem(editingItem.id, payload);
        const updated = { ...res.data, type: res.data.media_type };
        setItems((prev) => prev.map((it) => (it.id === editingItem.id ? updated : it)));
        showToast(`✓ Gallery media '${payload.title}' updated successfully.`);
      } else {
        const res = await adminAPI.createGalleryItem(payload);
        const created = { ...res.data, type: res.data.media_type };
        setItems((prev) => [...prev, created]);
        showToast(`✓ New gallery media '${payload.title}' published successfully.`);
      }
      setModalOpen(false);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to save gallery media. Please try again.';
      alert(`Save Error: ${detail}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title || 'this item'}" permanently from the gallery?`)) {
      return;
    }

    try {
      await adminAPI.deleteGalleryItem(item.id);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      showToast(`✓ Media item '${item.title || 'item'}' deleted.`);
    } catch (err) {
      // Fallback local update if mock/offline
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      showToast(`✓ Media item '${item.title || 'item'}' removed.`);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const res = await adminAPI.togglePublishGallery(item.id);
      const newStatus = res.data.is_published;
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_published: newStatus } : it))
      );
      showToast(newStatus === 1 ? '✓ Item published to public view.' : 'Item set to Draft (Hidden).');
    } catch (err) {
      const newStatus = item.is_published === 1 ? 0 : 1;
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_published: newStatus } : it))
      );
      showToast(newStatus === 1 ? '✓ Item published.' : 'Item hidden.');
    }
  };

  const handleReorder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update display_order sequence
    const updatedWithOrder = newItems.map((it, idx) => ({ ...it, display_order: idx + 1 }));
    setItems(updatedWithOrder);

    try {
      const itemIds = updatedWithOrder.map((it) => it.id).filter(Boolean);
      await adminAPI.reorderGallery(itemIds);
      showToast('✓ Gallery display order saved.');
    } catch (err) {
      console.warn('Reorder API sync:', err);
    }
  };

  return (
    <div className="gallery-page-container">
      {/* Toast Notification */}
      {toastMsg && <div className="gallery-toast">{toastMsg}</div>}

      {/* 1. FIXED CONTINUOUS CINEMATIC VIDEO BACKGROUND */}
      <div className="gallery-fixed-bg-layer" aria-hidden="true">
        <video
          src="/videos/reel-wedding-highlights.mp4"
          poster="/bg1.png"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="gallery-fixed-bg-video"
        />
        <div className="gallery-fixed-bg-overlay" />
      </div>

      {/* 2. HERO SPOTLIGHT HEADER SECTION */}
      <section className="gallery-hero-section">
        <div className="gallery-hero-overlay" />
        <div className="gallery-hero-content">
          <h1 className="gallery-hero-title">Gallery</h1>
        </div>
      </section>

      {/* 3. DIRECT CMS ADMIN TOOLBAR (Visible in Admin/Super Admin Mode) */}
      {(isAdmin || isSuperAdmin) && (
        <div className="gallery-admin-toolbar">
          <div className="gallery-admin-status-dock">
            <span className="gallery-admin-badge">
              <span className="gallery-admin-pulse" />
              {isSuperAdmin ? '👑 Super Admin Direct CMS' : '🛡️ Admin Edit Mode'}
            </span>
            <span className="gallery-admin-count">
              {items.length} total assets ({items.filter((i) => i.is_published === 1).length} published)
            </span>
          </div>

          <div className="gallery-admin-controls-group">
            {/* Filter by media type */}
            <select
              className="gallery-admin-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter Media Type"
            >
              <option value="ALL">All Media Types</option>
              <option value="image">Images Only</option>
              <option value="video">Videos Only</option>
            </select>

            {/* Filter by Category */}
            <select
              className="gallery-admin-filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter Category"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            {/* + Add Image/Video Button */}
            <button
              type="button"
              className="gallery-add-btn"
              onClick={handleOpenAddModal}
              title="Add new Image or Video to Gallery"
            >
              <span>+ Add Image/Video</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN MEDIA GALLERY SECTION */}
      <main className="gallery-main-section">
        <div className="gallery-editorial-grid">
          {displayedItems.map((item, index) => {
            const rawIndex = items.findIndex((it) => it.id === item.id);
            return (
              <div
                key={item.id || `gallery-item-${index}`}
                className={`gallery-card ${item.type === 'video' || item.media_type === 'video' ? 'gallery-video-card' : ''} ${getAnimDirectionClass(index)} ${getFloatClass(index)}`}
                style={{ '--card-stagger-delay': `${(index % 4) * 45}ms` }}
              >
                {/* Media Presentation */}
                {item.type === 'image' || item.media_type === 'image' ? (
                  <div
                    className="gallery-card-img-wrapper"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={item.src}
                      alt={item.title || 'Gallery visual'}
                      className="gallery-card-img"
                      loading="lazy"
                      decoding="async"
                      width="380"
                      height="320"
                    />
                    <div className="gallery-card-zoom-icon" title="View Fullscreen">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div
                    className="gallery-card-video-wrapper"
                    onClick={() => openLightbox(index)}
                  >
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current[item.id || `vid-${index}`] = el;
                      }}
                      src={item.src}
                      poster={item.poster_url || undefined}
                      className="gallery-card-video"
                      muted
                      loop
                      playsInline
                      preload="none"
                    />
                    <div className="gallery-card-zoom-icon" title="View Fullscreen Video">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Direct Management Action Bar (Admin / Super Admin Only) */}
                {(isAdmin || isSuperAdmin) && (
                  <div className="gallery-card-admin-bar">
                    <div className="gallery-card-admin-info">
                      <span className="gallery-card-admin-title" title={item.title}>
                        {item.title || 'Untitled'}
                      </span>
                      <div className="gallery-card-admin-badge-row">
                        <span
                          className={`gallery-status-pill ${item.is_published === 1 ? 'published' : 'draft'}`}
                          onClick={() => handleTogglePublish(item)}
                          title="Click to toggle publish status"
                        >
                          {item.is_published === 1 ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <div className="gallery-card-admin-actions">
                      {/* View Action */}
                      <button
                        type="button"
                        className="btn-card-admin"
                        onClick={() => openLightbox(index)}
                        title="View Fullscreen Preview"
                      >
                        👁️ View
                      </button>

                      {/* Edit / Replace Action */}
                      <button
                        type="button"
                        className="btn-card-admin"
                        onClick={() => handleOpenEditModal(item)}
                        title="Edit metadata or replace media asset"
                      >
                        ✏️ Edit/Replace
                      </button>

                      {/* Reorder: Move Left / Up */}
                      <button
                        type="button"
                        className="btn-card-admin"
                        onClick={() => handleReorder(rawIndex, -1)}
                        disabled={rawIndex === 0}
                        title="Move Left / Earlier"
                      >
                        ◀
                      </button>

                      {/* Reorder: Move Right / Down */}
                      <button
                        type="button"
                        className="btn-card-admin"
                        onClick={() => handleReorder(rawIndex, 1)}
                        disabled={rawIndex === items.length - 1}
                        title="Move Right / Later"
                      >
                        ▶
                      </button>

                      {/* Delete Action */}
                      <button
                        type="button"
                        className="btn-card-admin btn-danger"
                        onClick={() => handleDeleteItem(item)}
                        title="Delete permanently from gallery"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* 5. FULLSCREEN HD LIGHTBOX MODAL */}
      {lightboxOpen && displayedItems[lightboxIndex] && (
        <div className="gallery-lightbox-modal" onClick={closeLightbox}>
          <button
            className="lightbox-close-btn"
            onClick={closeLightbox}
            title="Close (Esc)"
            aria-label="Close Lightbox"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <button
            className="lightbox-nav-btn prev"
            onClick={(e) => {
              e.stopPropagation();
              prevLightbox();
            }}
            title="Previous (Left Arrow)"
            aria-label="Previous Media"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="gallery-lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-lightbox-media-wrapper">
              {displayedItems[lightboxIndex].type === 'image' || displayedItems[lightboxIndex].media_type === 'image' ? (
                <img
                  src={displayedItems[lightboxIndex].src}
                  alt={displayedItems[lightboxIndex].title || 'Gallery full view'}
                  className="gallery-lightbox-img"
                />
              ) : (
                <video
                  key={`lightbox-vid-${displayedItems[lightboxIndex].id || lightboxIndex}`}
                  src={displayedItems[lightboxIndex].src}
                  poster={displayedItems[lightboxIndex].poster_url || undefined}
                  className="gallery-lightbox-video"
                  controls
                  autoPlay
                  playsInline
                />
              )}
            </div>
          </div>

          <button
            className="lightbox-nav-btn next"
            onClick={(e) => {
              e.stopPropagation();
              nextLightbox();
            }}
            title="Next (Right Arrow)"
            aria-label="Next Media"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <div className="lightbox-counter-badge">
            {lightboxIndex + 1} / {displayedItems.length}
          </div>
        </div>
      )}

      {/* 6. ADMIN ADD / EDIT / REPLACE MODAL */}
      {modalOpen && (
        <div className="gallery-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="gallery-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <h2 className="gallery-modal-title">
                {editingItem ? 'Edit / Replace Gallery Media' : 'Add New Gallery Media'}
              </h2>
              <button
                type="button"
                className="gallery-modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className="gallery-modal-body">
                {/* Title and Category */}
                <div className="gallery-form-row">
                  <div className="gallery-form-col">
                    <label className="gallery-label">Title / Caption Label *</label>
                    <input
                      type="text"
                      className="gallery-input"
                      placeholder="e.g. Royal Stage Elegance"
                      required
                      value={formValues.title}
                      onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                    />
                  </div>

                  <div className="gallery-form-col">
                    <label className="gallery-label">Category</label>
                    <input
                      type="text"
                      className="gallery-input"
                      list="gallery-categories-list"
                      placeholder="e.g. Weddings, Decor, Highlights"
                      value={formValues.category}
                      onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                    />
                    <datalist id="gallery-categories-list">
                      {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Media Type & Publish Status */}
                <div className="gallery-form-row">
                  <div className="gallery-form-col">
                    <label className="gallery-label">Media Type</label>
                    <select
                      className="gallery-select"
                      value={formValues.media_type}
                      onChange={(e) => setFormValues({ ...formValues, media_type: e.target.value })}
                    >
                      <option value="image">Image (.jpg, .png, .webp, .gif)</option>
                      <option value="video">Video (.mp4, .webm, .mov)</option>
                    </select>
                  </div>

                  <div className="gallery-form-col">
                    <label className="gallery-label">Publish Status</label>
                    <select
                      className="gallery-select"
                      value={formValues.is_published}
                      onChange={(e) => setFormValues({ ...formValues, is_published: parseInt(e.target.value) })}
                    >
                      <option value={1}>Published (Visible to all visitors)</option>
                      <option value={0}>Draft (Admin only)</option>
                    </select>
                  </div>
                </div>

                {/* Upload or Enter Media Source */}
                <div className="gallery-form-col">
                  <label className="gallery-label">Media File Upload / Replace</label>
                  <div
                    className="gallery-upload-box"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="gallery-upload-icon">📁</span>
                    <span className="gallery-upload-text">
                      {uploading ? 'Uploading to persistent storage...' : 'Click to select an image or video file from device'}
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept={formValues.media_type === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                {/* Direct Source URL */}
                <div className="gallery-form-col">
                  <label className="gallery-label">Direct Media URL / Relative Path *</label>
                  <input
                    type="text"
                    className="gallery-input"
                    placeholder="e.g. /uploads/... or /videos/... or /bg.png"
                    required
                    value={formValues.src}
                    onChange={(e) => setFormValues({ ...formValues, src: e.target.value })}
                  />
                </div>

                {/* Poster URL (for videos) */}
                {formValues.media_type === 'video' && (
                  <div className="gallery-form-col">
                    <label className="gallery-label">Video Poster / Thumbnail Image URL</label>
                    <input
                      type="text"
                      className="gallery-input"
                      placeholder="e.g. /bg1.png"
                      value={formValues.poster_url}
                      onChange={(e) => setFormValues({ ...formValues, poster_url: e.target.value })}
                    />
                  </div>
                )}

                {/* Media Preview if URL is set */}
                {formValues.src && (
                  <div className="gallery-form-col">
                    <label className="gallery-label">Live Preview</label>
                    <div className="gallery-preview-box">
                      {formValues.media_type === 'image' ? (
                        <img
                          src={formValues.src}
                          alt="Preview"
                          className="gallery-preview-img"
                        />
                      ) : (
                        <video
                          src={formValues.src}
                          poster={formValues.poster_url || undefined}
                          className="gallery-preview-vid"
                          controls
                          muted
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="gallery-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                  disabled={saving || uploading}
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Media' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
