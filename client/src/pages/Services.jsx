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
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
    video_url: '/videos/celebration.webm',
    features: ['Bespoke Theme Architecture', 'Vendor Synchronization', 'Day-of Concierge & Flow'],
    gallery: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 2,
    name: 'Reception & Engagement',
    category: 'Weddings',
    subtitle: 'Grand Stage Entrances & Ambient Celebrations',
    description: 'Grand ring ceremony setups, luxury stage entrances, floral backdrops, and complete guest hospitality.',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=85',
    features: ['Grand Entrance Staging', 'Ambient Floral Canopy', 'VIP Reception Hospitality'],
    gallery: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 3,
    name: 'Corporate Events',
    category: 'Corporate',
    subtitle: 'Executive Conferences, Galas & Summits',
    description: 'Professional business conferences, product launches, annual company meets, and team celebrations.',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=85',
    features: ['Keynote Stage & Podium', 'Live Broadcast AV Rigs', 'Executive Lounge Hosting'],
    gallery: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 4,
    name: 'Cultural Events',
    category: 'Corporate',
    subtitle: 'Performance Rigs & Festival Production',
    description: 'Vibrant college fest execution, traditional performance stages, sound systems, and lighting management.',
    image_url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=85',
    video_url: '/videos/celebration.webm',
    features: ['Traditional Decor Accents', 'Acoustic Line Arrays', 'Artist & Green Room Logistics'],
    gallery: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 5,
    name: 'Birthday Parties',
    category: 'Birthdays',
    subtitle: 'Immersive Themes & Joyful Milestone Celebrations',
    description: 'Customized themed birthday setups for children and adults with fun activities and decorative cake tables.',
    image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=85',
    features: ['Custom Thematic Backdrop', 'Interactive Activities & DJ', 'Decorative Dessert Tables'],
    gallery: [
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 6,
    name: 'Baby Shower',
    category: 'Birthdays',
    subtitle: 'Ethereal Pastels & Blessing Ceremonies',
    description: 'Traditional and modern baby shower themes, decorated cradle setups, photo booths, and event management.',
    image_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=85',
    features: ['Floral Cradle Decoration', 'Themed Photo Booth', 'Welcome Hospitality & Gifts'],
    gallery: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 7,
    name: 'Surprise Events',
    category: 'Entertainment',
    subtitle: 'Intimate Proposals & Secret Milestone Moments',
    description: 'Memorable romantic proposals, anniversary surprises, secret birthday celebrations, and custom setups.',
    image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1600&q=85',
    features: ['Secret Location Setup', 'Candlelight & Rose Pathway', 'Live Acoustic Serenade'],
    gallery: [
      'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 8,
    name: 'Stage Decorations',
    category: 'Weddings',
    subtitle: 'Majestic Floral Sculptures & Modern Architecture',
    description: 'Elegant flower arc stages, custom balloon backdrops, ambient lighting, and modern thematic decorations.',
    image_url: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1600&q=85',
    features: ['Custom Floral Sculptures', 'Dynamic Beam Illumination', '3D Textured Stage Backdrops'],
    gallery: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 9,
    name: 'Catering Services',
    category: 'Weddings',
    subtitle: 'Banana Leaf Feasts & Luxury Multi-Cuisine Buffets',
    description: 'Delicious vegetarian and non-vegetarian buffet spreads, traditional banana leaf feasts, and live counters.',
    image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=85',
    features: ['Traditional Banana Leaf Feasts', 'Gourmet Multi-Cuisine Buffet', 'Master Culinary Chefs'],
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 10,
    name: 'Photography',
    category: 'Entertainment',
    subtitle: 'Candid Storytelling & Cinematic Portraits',
    description: 'High-resolution candid photography, traditional portraits, pre-wedding photoshoots, and premium albums.',
    image_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1600&q=85',
    features: ['Ultra-HD Candid Coverage', 'Cinematic Portraiture', 'Premium Leatherbound Albums'],
    gallery: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 11,
    name: 'Videography',
    category: 'Entertainment',
    subtitle: '4K Cinema Drone Films & Live Highlights',
    description: 'Cinematic 4K video coverage, aerial drone shots, live event streaming setups, and highlight editing.',
    image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=85',
    video_url: '/videos/celebration.webm',
    features: ['4K Cinema Drone Aerials', 'Same-Day Highlight Teasers', 'Multi-Cam Live Streaming'],
    gallery: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 12,
    name: 'Entertainment & DJ',
    category: 'Entertainment',
    subtitle: 'High-Octane Sound, Lasers & Celebrity Hosts',
    description: 'High-energy live DJ performances, concert-grade sound setups, LED dance floors, and event anchors.',
    image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=85',
    video_url: '/videos/laser-show.webm',
    features: ['Pro Concert Audio Rig', 'Intelligent Laser Fixtures', 'Celebrity Emcees & DJs'],
    gallery: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=85'
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
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  const categoriesList = [
    { id: 'all', label: 'All Services' },
    { id: 'Weddings', label: 'Weddings & Receptions' },
    { id: 'Corporate', label: 'Corporate & Summits' },
    { id: 'Birthdays', label: 'Milestones & Birthdays' },
    { id: 'Entertainment', label: 'Entertainment & Production' },
  ];

  const displayedServices = selectedCategory === 'all'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  const activeService = services.find((s) => s.id === activeServiceId) || displayedServices[0] || DEFAULT_SERVICES[0];

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
          1. HERO SECTION (Visual Reference: Creating Moments, Delivering Experiences)
          ========================================================================= */}
      <section className="services-hero-reference-layout">
        <div className="services-hero-bg-lights" />

        {/* Left Content Column */}
        <div className="services-ref-hero-left">
          <div className="services-ref-hero-overline">
            <span className="ref-overline-text">Our Services</span>
            <div className="ref-overline-bar" />
          </div>

          <h1 className="services-ref-hero-title">
            Creating Moments,<br />
            <span className="ref-title-cyan">Delivering Experiences</span>
          </h1>

          <p className="services-ref-hero-desc">
            We offer a wide range of event management services to make your special moments truly unforgettable. From grand weddings to corporate events, we bring your vision to life.
          </p>

          <div className="services-ref-hero-actions">
            <a href="#services-main-showcase" className="btn-ref-primary">
              <span>Explore Services</span>
              <span className="btn-arrow-icon">→</span>
            </a>
            <button
              type="button"
              className="btn-ref-watch"
              onClick={() => {
                const mainShowcase = document.getElementById('services-main-showcase');
                if (mainShowcase) {
                  mainShowcase.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <div className="watch-play-circle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span>Watch Our Work</span>
            </button>
          </div>

          {searchKeyword && (
            <div className="services-search-status">
              <span>Showing results for: <strong>"{searchKeyword}"</strong></span>
              <button type="button" className="services-clear-search" onClick={clearSearch}>
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Right Visual Composition Column (Template Reference) */}
        <div className="services-ref-hero-right">
          <div className="ref-visual-stage">
            <div className="ref-beam-accent" />
            <div className="ref-angled-frame-bg" />
            <img
              src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=85"
              alt="Special Moment Celebration"
              className="ref-couple-main-img"
            />
            <div className="ref-floating-stage-card">
              <img
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80"
                alt="Grand Production Stage"
                className="ref-stage-thumb-img"
              />
            </div>
            <div className="ref-script-overlay">
              <span>Better Events,</span>
              <span>Greater Memories</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. BRAND MANIFESTO & ASYMMETRIC IMAGE BLOCKS (Visual Reference Block)
          ========================================================================= */}
      <section className="services-manifesto-section">
        <div className="manifesto-kicker-row">
          <span className="manifesto-kicker-dot"></span>
          <span className="manifesto-kicker-text">Our Philosophy</span>
        </div>

        <div className="services-manifesto-layout">
          <p className="manifesto-statement-text">
            We are a premier event collective that helps brands and families 
            <span className="manifesto-highlight-pill">CRAFT</span>
            unforgettable real-life experiences.
          </p>

          <div className="manifesto-asymmetric-media-block">
            <img
              src={activeService.gallery ? activeService.gallery[0] : activeService.image_url}
              alt="Live Production Atmosphere"
              className="manifesto-media-img"
            />
            <span className="manifesto-media-badge">EXPERIENCE</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. ASYMMETRIC CATEGORY FILTER CHIPS (Top Right Block Reference)
          ========================================================================= */}
      <section className="services-category-strip-section">
        <div className="services-chips-grid">
          {categoriesList.map((cat) => {
            const count = cat.id === 'all'
              ? services.length
              : services.filter((s) => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                className={`service-asymmetric-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const firstOfCat = cat.id === 'all' ? services[0] : services.find((s) => s.category === cat.id);
                  if (firstOfCat) setActiveServiceId(firstOfCat.id);
                }}
              >
                <span>{cat.label}</span>
                <span className="chip-counter">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. "WHAT'S IN THE SPOTLIGHT" / MAIN EDITORIAL SHOWCASE (Reference Grid)
          ========================================================================= */}
      <section className="services-editorial-showcase-section" id="services-main-showcase">
        <div className="editorial-section-header">
          <h2 className="editorial-section-title">What's In The Spotlight</h2>
          <span className="editorial-section-subtitle">Curated Offerings</span>
        </div>

        <div className="services-editorial-split-stage">
          {/* Left Big Featured Card with Notched Corner */}
          <div className="featured-showcase-master-card">
            <div className="featured-media-container">
              {activeService.video_url ? (
                <video
                  key={`vid-${activeService.id}`}
                  src={activeService.video_url}
                  poster={activeService.image_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="featured-media-element"
                  title={activeService.name}
                />
              ) : (
                <img
                  key={`img-${activeService.id}`}
                  src={activeService.image_url}
                  alt={activeService.name}
                  className="featured-media-element"
                />
              )}
              <div className="featured-media-gradient"></div>
              <span className="featured-floating-badge">{activeService.category}</span>
            </div>

            <div className="featured-content-dock">
              <div>
                <span className="featured-kicker">{activeService.subtitle}</span>
                <h3 className="featured-title">{activeService.name}</h3>
                <p className="featured-desc">{activeService.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Vertical Asymmetric Editorial Cards List */}
          <div className="services-editorial-nav-list">
            {displayedServices.map((s, index) => {
              const isCurrent = s.id === activeServiceId;
              return (
                <div
                  key={s.id}
                  className={`editorial-nav-card ${isCurrent ? 'active' : ''}`}
                  onClick={() => handleSelectService(s.id)}
                >
                  <div className="editorial-nav-left">
                    <span className="editorial-nav-num">{String(index + 1).padStart(2, '0')}</span>
                    <div className="editorial-nav-info">
                      <h4>{s.name}</h4>
                      <span>{s.category}</span>
                    </div>
                  </div>
                  <span className="editorial-nav-arrow">→</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CREATIVE DUAL ASYMMETRIC DETAILS & INCLUSIONS
          ========================================================================= */}
      <section className="services-details-inclusions-section">
        {/* Dual Asymmetric Notched Creative Blocks */}
        {activeService.gallery && activeService.gallery.length >= 2 && (
          <div className="services-dual-creative-grid">
            <div className="creative-media-block left-notched">
              <img
                src={activeService.gallery[0]}
                alt={`${activeService.name} Detail 1`}
                className="creative-img"
                loading="lazy"
              />
              <div className="creative-overlay"></div>
            </div>
            <div className="creative-media-block right-notched">
              <img
                src={activeService.gallery[1]}
                alt={`${activeService.name} Detail 2`}
                className="creative-img"
                loading="lazy"
              />
              <div className="creative-overlay"></div>
            </div>
          </div>
        )}

        {/* What You Get / Included Offerings */}
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
      </section>

      {/* =========================================================================
          6. "MEET THE MINDS" & CRAFTSMANSHIP GUARANTEE PILLARS
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
