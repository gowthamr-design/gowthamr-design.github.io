import React, { useState, useEffect, useRef } from 'react';
import '../styles/gallery.css';

// All image assets available in client/public and its subfolders
const galleryImages = [
  { id: 'img-1', type: 'image', src: '/f214bc94-72b6-4202-9a01-2cece637fc3d.png' },
  { id: 'img-2', type: 'image', src: '/f7cabbcd-e205-4b02-9924-97ccfe667442.png' },
  { id: 'img-3', type: 'image', src: '/bg.png' },
  { id: 'img-4', type: 'image', src: '/bg1.png' },
  { id: 'img-5', type: 'image', src: '/bg_blue.png' },
  { id: 'img-6', type: 'image', src: '/videos/571166326_18053531924313917_6459894921198886133_n.webp' },
  { id: 'img-7', type: 'image', src: '/BB_Logo.jpg' },
  { id: 'img-8', type: 'image', src: '/BB_Logo2.jpg' },
  { id: 'img-9', type: 'image', src: '/BB_Logo3.jpg' },
];

// All video assets available in client/public/videos
const galleryVideos = [
  { id: 'vid-1', type: 'video', src: '/videos/reel-wedding-highlights.mp4' },
  { id: 'vid-2', type: 'video', src: '/videos/reel-grand-entry.mp4' },
  { id: 'vid-3', type: 'video', src: '/videos/reel-celebration-event.mp4' },
  { id: 'vid-4', type: 'video', src: '/videos/reel-chenda-cultural.mp4' },
  { id: 'vid-5', type: 'video', src: '/videos/reel-stage-concert.mp4' },
  { id: 'vid-6', type: 'video', src: '/videos/reel-badaga-tradition.mp4' },
  { id: 'vid-7', type: 'video', src: '/videos/reel-dj-lights.mp4' },
  { id: 'vid-8', type: 'video', src: '/videos/reel-candid-entry.mp4' },
  { id: 'vid-9', type: 'video', src: '/videos/reel-reception-decor.mp4' },
  { id: 'vid-10', type: 'video', src: '/videos/reel-short-teaser.mp4' },
];

const allMediaItems = [...galleryImages, ...galleryVideos];

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const videoRefs = useRef({});

  const openLightbox = (index) => {
    // Pause all inline preview videos when lightbox opens
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
    setLightboxIndex((prev) => (prev + 1) % allMediaItems.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + allMediaItems.length) % allMediaItems.length);
  };

  // Viewport IntersectionObserver to autoplay inline muted videos smoothly only when visible
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
  }, [lightboxOpen]);

  // Viewport IntersectionObserver to reveal cards once smoothly with GPU acceleration
  useEffect(() => {
    const cardElements = document.querySelectorAll('.gallery-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // Unobserve once revealed so no unnecessary recalculations occur during scroll
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '40px 0px 0px 0px',
      }
    );

    cardElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  // Keyboard navigation (Esc, Left, Right) + Body scroll lock
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
  }, [lightboxOpen, allMediaItems.length]);

  return (
    <div className="gallery-page-container">
      {/* 1. FIXED CONTINUOUS CINEMATIC VIDEO BACKGROUND ACROSS ENTIRE PAGE */}
      <div className="gallery-fixed-bg-layer" aria-hidden="true">
        <video
          src="/videos/reel-wedding-highlights.mp4"
          poster="/bg1.png"
          autoPlay
          loop
          muted
          playsInline
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

      {/* 3. MAIN MEDIA GALLERY SECTION (SCROLLING GLASS CONTENT) */}
      <main className="gallery-main-section">
        <div className="gallery-editorial-grid">
          {allMediaItems.map((item, index) => (
            <div
              key={item.id}
              className={`gallery-card ${item.type === 'video' ? 'gallery-video-card' : ''} ${getAnimDirectionClass(index)} ${getFloatClass(index)}`}
              style={{ '--card-stagger-delay': `${(index % 4) * 45}ms` }}
            >
              {item.type === 'image' ? (
                <div
                  className="gallery-card-img-wrapper"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={item.src}
                    alt="Gallery visual"
                    className="gallery-card-img"
                    loading="lazy"
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
                      if (el) videoRefs.current[item.id] = el;
                    }}
                    src={item.src}
                    className="gallery-card-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
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
            </div>
          ))}
        </div>
      </main>

      {/* 4. FULLSCREEN HD LIGHTBOX MODAL */}
      {lightboxOpen && allMediaItems[lightboxIndex] && (
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
              {allMediaItems[lightboxIndex].type === 'image' ? (
                <img
                  src={allMediaItems[lightboxIndex].src}
                  alt="Gallery full view"
                  className="gallery-lightbox-img"
                />
              ) : (
                <video
                  key={`lightbox-vid-${allMediaItems[lightboxIndex].id}`}
                  src={allMediaItems[lightboxIndex].src}
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
            {lightboxIndex + 1} / {allMediaItems.length}
          </div>
        </div>
      )}
    </div>
  );
}
