import React, { useState, useEffect } from 'react';
import '../styles/gallery.css';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const categories = [
    { id: 'all', label: 'All Moments' },
    { id: 'weddings', label: 'Royal Weddings' },
    { id: 'corporate', label: 'Corporate Galas' },
    { id: 'celebrations', label: 'Milestones & Birthdays' },
    { id: 'concerts', label: 'Concerts & Festivals' },
  ];

  const galleryItems = [
    {
      id: 1,
      type: 'quote',
      quote: '“We loved with a love that was more than love.”',
      author: 'Edgar Allan Poe',
      category: 'weddings',
    },
    {
      id: 2,
      type: 'image',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      title: 'Grand Floral Mandap Sanctuary',
      subtitle: 'Luxury Royal Wedding Staging',
      category: 'weddings',
      tag: 'Royal Tier',
      location: 'Grand Palace Hall, Chennai',
    },
    {
      id: 3,
      type: 'image',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85',
      title: 'The Golden Celebratory Toast',
      subtitle: 'Outdoor Sunset Toast & Champagne',
      category: 'weddings',
      tag: 'Celebration',
      location: 'Beachfront Lawn, Mahabalipuram',
    },
    {
      id: 4,
      type: 'image',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
      title: 'Enchanted Forest Canopy Arch',
      subtitle: 'Fairy-Light Rustic Wedding Arch',
      category: 'weddings',
      tag: 'Ethereal Decor',
      location: 'Pine Hills Pavilion, Ooty',
    },
    {
      id: 5,
      type: 'image',
      hasSocial: true,
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
      title: 'Pampas Grass Ceremonial Vows',
      subtitle: 'Bohemian Luxe Ceremonial Staging',
      category: 'weddings',
      tag: 'Boho Luxe',
      location: 'Royal Heritage Lawn, Bangalore',
    },
    {
      id: 6,
      type: 'image',
      image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=85',
      title: 'Vibrant Floral Radiance',
      subtitle: 'Multi-Color Botanical Archway',
      category: 'weddings',
      tag: 'Botanical Staging',
      location: 'Imperial Ballroom, Coimbatore',
    },
    {
      id: 7,
      type: 'image',
      image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=85',
      title: 'Rustic Gazebo Symphony',
      subtitle: 'Hand-Crafted Timber & Flora Staging',
      category: 'weddings',
      tag: 'Intimate Luxury',
      location: 'Garden Estate, Pondicherry',
    },
    {
      id: 8,
      type: 'image',
      image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85',
      title: 'Moments of Pure Devotion',
      subtitle: 'Cinematic Candid Portraiture',
      category: 'weddings',
      tag: 'Signature Candid',
      location: 'Temple Pavilion, Madurai',
    },
    {
      id: 9,
      type: 'quote',
      isAccent: true,
      quote: '“Every love story is beautiful, but ours is our favorite.”',
      author: 'Banana Brothers Moments',
      category: 'celebrations',
    },
    {
      id: 10,
      type: 'image',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85',
      title: 'Global Tech Leadership Summit',
      subtitle: 'Panoramic 4K AV & Keynote Staging',
      category: 'corporate',
      tag: 'Executive Tier',
      location: 'ITC Grand Convention, Chennai',
    },
    {
      id: 11,
      type: 'image',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=85',
      title: 'Arena Live Cultural Symphony',
      subtitle: 'Line-Array Acoustics & Laser Grid',
      category: 'concerts',
      tag: 'Arena Production',
      location: 'JLN Stadium, Kochi',
    },
    {
      id: 12,
      type: 'image',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85',
      title: 'Golden Jubilee Celebration Gala',
      subtitle: 'Artisanal Thematic Lighting & Decor',
      category: 'celebrations',
      tag: 'Milestone Gala',
      location: 'Leela Palace, Chennai',
    },
  ];

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory || item.type === 'quote');

  const imageOnlyList = filteredItems.filter((item) => item.type === 'image');

  const openLightbox = (imgItem) => {
    const idx = imageOnlyList.findIndex((it) => it.id === imgItem.id);
    if (idx !== -1) {
      setLightboxIndex(idx);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % imageOnlyList.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + imageOnlyList.length) % imageOnlyList.length);
  };

  // Keyboard navigation for lightbox (Esc, Left, Right) + Body scroll lock
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
  }, [lightboxOpen, imageOnlyList.length]);

  return (
    <div className="gallery-page-container">
      {/* 1. HERO SPOTLIGHT HEADER SECTION */}
      <section className="gallery-hero-section">
        <div className="gallery-hero-bg" />
        <div className="gallery-hero-overlay" />

        <div className="gallery-hero-content">
          <h1 className="gallery-hero-title">Gallery</h1>

          <p className="gallery-hero-tagline">
            This is your moment to recount the beautiful steps you and your partner are taking together as you prepare for your big day.
          </p>
        </div>
      </section>

      {/* 2. MAIN GALLERY SECTION */}
      <main className="gallery-main-section">
        {/* Section Header */}
        <div className="gallery-header-block">
          <span className="gallery-subtitle">Sweet Memories</span>
          <h2 className="gallery-main-title">Our Captured Moments</h2>

          {/* Filter Pills Bar */}
          <div className="gallery-filter-bar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`gallery-filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. EDITORIAL MAGAZINE GALLERY GRID */}
        <div className="gallery-editorial-grid">
          {filteredItems.map((item) => {
            if (item.type === 'quote') {
              return (
                <div
                  key={item.id}
                  className={`gallery-quote-card ${item.isAccent ? 'accent-card' : ''}`}
                >
                  <div className="gallery-quote-inner">
                    <p className="gallery-quote-text">{item.quote}</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`gallery-card ${item.hasSocial ? 'gallery-card-with-social' : ''}`}
                onClick={() => openLightbox(item)}
              >
                <div className="gallery-card-img-wrapper">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="gallery-card-img"
                    loading="lazy"
                  />

                  {/* Zoom Preview Icon */}
                  <div className="gallery-card-zoom-icon" title="View in HD Lightbox">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  </div>

                  {/* Hover Overlay with Metadata */}
                  <div className="gallery-card-hover-overlay">
                    <span className="gallery-card-tag">{item.tag}</span>
                    <h3 className="gallery-card-title">{item.title}</h3>
                    <p className="gallery-card-location">📍 {item.location}</p>
                  </div>
                </div>

                {/* Floating Social Icons Bar on Reference Center Item */}
                {item.hasSocial && (
                  <div className="gallery-floating-social-strip" onClick={(e) => e.stopPropagation()}>
                    {/* Facebook */}
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-strip-btn" title="Facebook" aria-label="Facebook">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    </a>
                    {/* Twitter / X */}
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-strip-btn" title="Twitter" aria-label="Twitter">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                      </svg>
                    </a>
                    {/* YouTube */}
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-strip-btn" title="YouTube" aria-label="YouTube">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff"/>
                      </svg>
                    </a>
                    {/* Pinterest */}
                    <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-strip-btn" title="Pinterest" aria-label="Pinterest">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    {/* Instagram */}
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-strip-btn" title="Instagram" aria-label="Instagram">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* 4. FULLSCREEN HD LIGHTBOX MODAL */}
      {lightboxOpen && imageOnlyList[lightboxIndex] && (
        <div className="gallery-lightbox-modal" onClick={closeLightbox}>
          {/* Close Button */}
          <button className="lightbox-close-btn" onClick={closeLightbox} title="Close (Esc)" aria-label="Close Lightbox">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Previous Button */}
          <button
            className="lightbox-nav-btn prev"
            onClick={(e) => {
              e.stopPropagation();
              prevLightbox();
            }}
            title="Previous (Left Arrow)"
            aria-label="Previous Image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Lightbox Main Container */}
          <div className="gallery-lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-lightbox-media-wrapper">
              <img
                src={imageOnlyList[lightboxIndex].image}
                alt={imageOnlyList[lightboxIndex].title}
                className="gallery-lightbox-img"
              />
            </div>

            <div className="gallery-lightbox-caption">
              <h3 className="gallery-lightbox-title">{imageOnlyList[lightboxIndex].title}</h3>
              <p className="gallery-lightbox-sub">
                📍 {imageOnlyList[lightboxIndex].location} • {imageOnlyList[lightboxIndex].subtitle}
              </p>
            </div>
          </div>

          {/* Next Button */}
          <button
            className="lightbox-nav-btn next"
            onClick={(e) => {
              e.stopPropagation();
              nextLightbox();
            }}
            title="Next (Right Arrow)"
            aria-label="Next Image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Counter Badge */}
          <div className="lightbox-counter-badge">
            {lightboxIndex + 1} / {imageOnlyList.length}
          </div>
        </div>
      )}
    </div>
  );
}
