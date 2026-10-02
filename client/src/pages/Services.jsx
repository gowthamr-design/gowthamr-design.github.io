import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { catalogAPI } from '../services/api';
import '../styles/services.css';

const DEFAULT_SERVICES = [
  {
    id: 1,
    name: 'Wedding Planners',
    category: 'Weddings',
    subtitle: 'End-to-End Bespoke Wedding Curation',
    description: 'Complete end-to-end wedding management with traditional arrangements, themed setups, and seamless coordination.',
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
    video_url: '/videos/celebration.webm',
    features: ['Bespoke Theme Architecture', 'Vendor Synchronization', 'Day-of Concierge & Flow'],
    gallery: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 2,
    name: 'Reception & Engagement',
    category: 'Weddings',
    subtitle: 'Grand Stage Entrances & Ambient Celebrations',
    description: 'Grand ring ceremony setups, luxury stage entrances, floral backdrops, and complete guest hospitality.',
    image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80',
    features: ['Grand Entrance Staging', 'Ambient Floral Canopy', 'VIP Reception Hospitality'],
    gallery: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 3,
    name: 'Corporate Events',
    category: 'Corporate',
    subtitle: 'Executive Conferences, Galas & Summits',
    description: 'Professional business conferences, product launches, annual company meets, and team celebrations.',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80',
    features: ['Keynote Stage & Podium', 'Live Broadcast AV Rigs', 'Executive Lounge Hosting'],
    gallery: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 4,
    name: 'Cultural Events',
    category: 'Corporate',
    subtitle: 'Performance Rigs & Festival Production',
    description: 'Vibrant college fest execution, traditional performance stages, sound systems, and lighting management.',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80',
    video_url: '/videos/celebration.webm',
    features: ['Traditional Decor Accents', 'Acoustic Line Arrays', 'Artist & Green Room Logistics'],
    gallery: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 5,
    name: 'Birthday Parties',
    category: 'Birthdays',
    subtitle: 'Immersive Themes & Joyful Milestone Celebrations',
    description: 'Customized themed birthday setups for children and adults with fun activities and decorative cake tables.',
    image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=80',
    features: ['Custom Thematic Backdrop', 'Interactive Activities & DJ', 'Decorative Dessert Tables'],
    gallery: [
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 6,
    name: 'Baby Shower',
    category: 'Birthdays',
    subtitle: 'Ethereal Pastels & Blessing Ceremonies',
    description: 'Traditional and modern baby shower themes, decorated cradle setups, photo booths, and event management.',
    image_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80',
    features: ['Floral Cradle Decoration', 'Themed Photo Booth', 'Welcome Hospitality & Gifts'],
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 7,
    name: 'Surprise Events',
    category: 'Entertainment',
    subtitle: 'Intimate Proposals & Secret Milestone Moments',
    description: 'Memorable romantic proposals, anniversary surprises, secret birthday celebrations, and custom setups.',
    image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1400&q=80',
    features: ['Secret Location Setup', 'Candlelight & Rose Pathway', 'Live Acoustic Serenade'],
    gallery: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 8,
    name: 'Stage Decorations',
    category: 'Weddings',
    subtitle: 'Majestic Floral Sculptures & Modern Architecture',
    description: 'Elegant flower arc stages, custom balloon backdrops, ambient lighting, and modern thematic decorations.',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
    features: ['Custom Floral Sculptures', 'Dynamic Beam Illumination', '3D Textured Stage Backdrops'],
    gallery: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 9,
    name: 'Catering Services',
    category: 'Weddings',
    subtitle: 'Banana Leaf Feasts & Luxury Multi-Cuisine Buffets',
    description: 'Delicious vegetarian and non-vegetarian buffet spreads, traditional banana leaf feasts, and live counters.',
    image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=80',
    features: ['Traditional Banana Leaf Feasts', 'Gourmet Multi-Cuisine Buffet', 'Master Culinary Chefs'],
    gallery: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 10,
    name: 'Photography',
    category: 'Entertainment',
    subtitle: 'Candid Storytelling & Cinematic Portraits',
    description: 'High-resolution candid photography, traditional portraits, pre-wedding photoshoots, and premium albums.',
    image_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1400&q=80',
    features: ['Ultra-HD Candid Coverage', 'Cinematic Portraiture', 'Premium Leatherbound Albums'],
    gallery: [
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 11,
    name: 'Videography',
    category: 'Entertainment',
    subtitle: '4K Cinema Drone Films & Live Highlights',
    description: 'Cinematic 4K video coverage, aerial drone shots, live event streaming setups, and highlight editing.',
    image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=80',
    video_url: '/videos/celebration.webm',
    features: ['4K Cinema Drone Aerials', 'Same-Day Highlight Teasers', 'Multi-Cam Live Streaming'],
    gallery: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 12,
    name: 'Entertainment & DJ',
    category: 'Entertainment',
    subtitle: 'High-Octane Sound, Lasers & Celebrity Hosts',
    description: 'High-energy live DJ performances, concert-grade sound setups, LED dance floors, and event anchors.',
    image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80',
    video_url: '/videos/laser-show.webm',
    features: ['Pro Concert Audio Rig', 'Intelligent Laser Fixtures', 'Celebrity Emcees & DJs'],
    gallery: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

const FAQS_DATA = [
  {
    question: 'How do you coordinate theme setups and on-site vendor flow?',
    answer: 'Our dedicated on-site event directors manage run-of-show protocols, sound check timings, floral placements, and vendor synchronization from initial setup to grand conclusion.'
  },
  {
    question: 'Can arrangements and decor be tailored to our specific venue?',
    answer: 'Yes, every stage architecture, lighting grid, floral arch, and banquet floor plan is custom-measured and modeled specifically for your selected indoor or outdoor venue.'
  },
  {
    question: 'What audiovisual standards and equipment are deployed?',
    answer: 'We exclusively deploy concert-grade line array sound systems, 4K multi-cam cinematography, wireless microphones, and intelligent DMX moving laser and wash fixtures.'
  },
  {
    question: 'How early should we initiate bespoke service planning?',
    answer: 'We recommend reserving 3 to 6 months prior for weddings and large corporate galas, and 3 to 4 weeks in advance for milestone birthdays and intimate celebrations.'
  }
];

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get('q') || '';
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [activeServiceId, setActiveServiceId] = useState(DEFAULT_SERVICES[0].id);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    catalogAPI.getServices('', searchKeyword)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const enriched = res.data.map((item) => {
            const def = DEFAULT_SERVICES.find((d) => d.name.toLowerCase() === item.name.toLowerCase()) || {};
            return {
              ...item,
              subtitle: item.subtitle || def.subtitle || `${item.category} Curation`,
              image_url: def.image_url || item.image_url,
              video_url: def.video_url || item.video_url,
              features: item.features || def.features || ['Bespoke Production', 'Dedicated Concierge', 'Flawless Execution'],
              gallery: def.gallery || [def.image_url || item.image_url, def.image_url || item.image_url]
            };
          });
          setServices(enriched);
          if (enriched.length > 0) {
            setActiveServiceId(enriched[0].id);
          }
        }
      })
      .catch(() => {
        let list = DEFAULT_SERVICES;
        if (searchKeyword) {
          const k = searchKeyword.toLowerCase();
          list = list.filter((s) => s.name.toLowerCase().includes(k) || s.description.toLowerCase().includes(k));
        }
        setServices(list);
        if (list.length > 0) {
          setActiveServiceId(list[0].id);
        }
      });
  }, [searchKeyword]);

  const activeService = services.find((s) => s.id === activeServiceId) || services[0] || DEFAULT_SERVICES[0];

  const clearSearch = () => {
    setSearchParams({});
  };

  const handleSelectService = (id) => {
    setActiveServiceId(id);
    const mainShowcase = document.getElementById('services-main-showcase');
    if (mainShowcase && window.innerWidth < 960) {
      mainShowcase.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="services-page-master">
      {/* Ambient Parallax Glowing Orbs */}
      <div className="services-ambient-orb services-orb-1"></div>
      <div className="services-ambient-orb services-orb-2"></div>
      <div className="services-ambient-orb services-orb-3"></div>

      {/* =========================================================================
          1. CINEMATIC BREADCRUMB & HERO HEADER
          ========================================================================= */}
      <section className="services-hero">
        <div className="services-hero-badge">
          <span className="sparkle">✦</span>
          <span>Bespoke Event Craftsmanship</span>
        </div>

        <h1 className="services-hero-title">
          {activeService.name}
        </h1>

        <div className="services-breadcrumb-trail">
          <span>Home</span>
          <span className="crumb-sep">/</span>
          <span>Services</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-active">{activeService.name}</span>
        </div>

        {searchKeyword && (
          <div className="services-search-status">
            <span>Showing results for: <strong>"{searchKeyword}"</strong></span>
            <button type="button" className="services-clear-search" onClick={clearSearch}>
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          2. REFERENCE-STYLE 2-COLUMN SERVICE SHOWCASE
          ========================================================================= */}
      <section className="services-showcase-container">
        <div className="services-reference-layout">

          {/* LEFT SIDEBAR: WIDGETS & SERVICE SELECTOR */}
          <aside className="services-sidebar-col">
            
            {/* Top Widget: Curation Timeline & Flow */}
            <div className="sidebar-widget-card">
              <h4 className="sidebar-widget-title">Service Timeline</h4>
              <p className="sidebar-widget-desc">
                Seamless progression from conceptual design architecture to on-site stage production and live coordination.
              </p>
            </div>

            {/* Middle Widget: Services Navigation List */}
            <div className="sidebar-widget-card sidebar-services-nav">
              <div className="sidebar-nav-header">
                <h4 className="sidebar-widget-title">All Services</h4>
                <span className="sidebar-service-count">{services.length} Total</span>
              </div>

              <nav className="sidebar-service-list" aria-label="Services Navigation">
                {services.map((s) => {
                  const isCurrent = s.id === activeServiceId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`sidebar-service-item ${isCurrent ? 'is-active-service' : ''}`}
                      onClick={() => handleSelectService(s.id)}
                      aria-current={isCurrent ? 'true' : 'false'}
                    >
                      <span className="sidebar-item-name">{s.name}</span>
                      <span className="sidebar-item-arrow">›</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Promo Widget: Unforgettable Callout Card */}
            <div className="sidebar-promo-card">
              <div className="sidebar-promo-bg"></div>
              <div className="sidebar-promo-content">
                <span className="sidebar-promo-sparkle">✦ ✦ ✦</span>
                <h3 className="sidebar-promo-title">Let's Make Your Event Unforgettable</h3>
                <p className="sidebar-promo-text">
                  Tailored spatial decor, acoustic excellence, and dedicated on-site event direction for every celebration.
                </p>
              </div>
            </div>

          </aside>

          {/* RIGHT MAIN SHOWCASE: IMAGE-BASED TEMPLATE */}
          <div className="services-main-col" id="services-main-showcase">
            
            {/* Main Showcase Header & Category Kicker */}
            <div className="showcase-header-dock">
              <span className="showcase-subtitle-kicker">{activeService.subtitle}</span>
              <h2 className="showcase-main-title">{activeService.name}</h2>
              <span className="showcase-category-pill">{activeService.category}</span>
            </div>

            {/* Primary Cinematic Event Hero Media */}
            <div className="showcase-hero-media-frame">
              {activeService.video_url ? (
                <video
                  key={`vid-${activeService.id}`}
                  src={activeService.video_url}
                  poster={activeService.image_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="showcase-hero-media"
                  title={activeService.name}
                />
              ) : (
                <img
                  key={`img-${activeService.id}`}
                  src={activeService.image_url}
                  alt={activeService.name}
                  className="showcase-hero-media"
                />
              )}
              <div className="showcase-media-overlay"></div>
              <div className="showcase-media-badge-live">
                <span className="live-media-dot"></span>
                <span>Signature Curation</span>
              </div>
            </div>

            {/* Primary Service Description Text */}
            <div className="showcase-desc-block">
              <p className="showcase-lead-desc">{activeService.description}</p>
            </div>

            {/* Secondary Spotlight Dual Mini Visuals */}
            {activeService.gallery && activeService.gallery.length >= 2 && (
              <div className="showcase-gallery-grid">
                <div className="showcase-gallery-item">
                  <img
                    src={activeService.gallery[0]}
                    alt={`${activeService.name} Detail 1`}
                    className="showcase-gallery-img"
                    loading="lazy"
                  />
                  <div className="gallery-img-overlay"></div>
                </div>
                <div className="showcase-gallery-item">
                  <img
                    src={activeService.gallery[1]}
                    alt={`${activeService.name} Detail 2`}
                    className="showcase-gallery-img"
                    loading="lazy"
                  />
                  <div className="gallery-img-overlay"></div>
                </div>
              </div>
            )}

            {/* What You Get / Included Services Block */}
            <div className="showcase-offerings-block">
              <h3 className="showcase-section-heading">What You Get</h3>
              <p className="showcase-section-subtext">
                Every booking includes our signature production standards, meticulous safety protocols, and experienced coordinators.
              </p>

              <div className="showcase-features-grid">
                {activeService.features && activeService.features.map((feat, fIdx) => (
                  <div key={fIdx} className="showcase-feature-cell">
                    <div className="feature-cell-icon">✦</div>
                    <span className="feature-cell-text">{feat}</span>
                  </div>
                ))}
                <div className="showcase-feature-cell">
                  <div className="feature-cell-icon">✦</div>
                  <span className="feature-cell-text">Dedicated Stage Coordinator</span>
                </div>
                <div className="showcase-feature-cell">
                  <div className="feature-cell-icon">✦</div>
                  <span className="feature-cell-text">High-Definition Visual Delivery</span>
                </div>
                <div className="showcase-feature-cell">
                  <div className="feature-cell-icon">✦</div>
                  <span className="feature-cell-text">Spotless Rehearsal & Flow</span>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions Accordion */}
            <div className="showcase-faq-block">
              <h3 className="showcase-section-heading">Frequently Asked Questions</h3>
              <div className="showcase-faq-list">
                {FAQS_DATA.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}
                    >
                      <button
                        type="button"
                        className="faq-accordion-header"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        aria-expanded={isOpen ? 'true' : 'false'}
                      >
                        <span className="faq-question-text">{faq.question}</span>
                        <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="faq-accordion-body">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          3. CRAFTSMANSHIP GUARANTEE & EXCELLENCE PILLARS
          ========================================================================= */}
      <section className="services-pillars-banner">
        <div className="services-pillars-grid">
          <div className="services-pillar-item">
            <span className="pillar-icon-gold">🏛️</span>
            <h3>Bespoke Spatial Design</h3>
            <p>Every floral structure, stage geometry, and lighting angle is tailored exclusively to your venue and tradition.</p>
          </div>

          <div className="services-pillar-item">
            <span className="pillar-icon-gold">⚡</span>
            <h3>Dedicated Production Lead</h3>
            <p>A dedicated on-site event coordinator ensures sound check precision, decor transitions, and spotless schedule flow.</p>
          </div>

          <div className="services-pillar-item">
            <span className="pillar-icon-gold">💎</span>
            <h3>Uncompromising Quality</h3>
            <p>Only concert-grade audiovisual rigs, fresh premium florals, and culinary masterchefs are deployed for your guests.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
