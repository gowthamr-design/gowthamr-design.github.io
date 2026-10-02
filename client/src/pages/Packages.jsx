import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/packages.css';

const PACKAGES_DATA = [
  {
    id: 'luxury-wedding',
    tier: 'high',
    tierBadge: 'Luxury Tier',
    category: 'Weddings & Royal Galas',
    name: 'LUXURY WEDDING',
    tagline: 'Royal Bespoke Experience',
    description: 'Complete royal wedding curation featuring monumental stage architectures, imported floral canopies, 4K multi-cam drone cinematography, and opulent culinary banquets.',
    price: '₹3,50,000',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Bespoke Stage Architecture & Imported Florals',
      '4K Cinematic Cinema Drone & Live Coverage',
      'Gourmet Multi-Cuisine Live Counter Buffet',
      'Dedicated VIP Concierge & Rehearsal Flow',
      'Premium Intelligent Concert Lighting & Laser Array'
    ],
    detailsLink: '/packages/high'
  },
  {
    id: 'premium-corporate',
    tier: 'medium',
    tierBadge: 'Executive Tier',
    category: 'Corporate Summits & Galas',
    name: 'PREMIUM CORPORATE',
    tagline: 'High-Impact Executive Production',
    description: 'Premier business conferences, product launches, and annual awards celebrations equipped with concert-grade line arrays, professional photography, and executive dining.',
    price: '₹1,20,000',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Keynote Staging & Live Broadcast AV Array',
      'Ultra-HD Candid Event Photography & Albums',
      'Concert-Grade Sound, Stage Rig & Pro DJ',
      'Executive Lounge Hospitality & Gala Buffet',
      'On-Site Technical Lead & Run-of-Show Protocol'
    ],
    detailsLink: '/packages/medium'
  },
  {
    id: 'signature-celebration',
    tier: 'low',
    tierBadge: 'Signature Tier',
    category: 'Milestones & Intimate Events',
    name: 'SIGNATURE CELEBRATION',
    tagline: 'Vibrant Milestone Memories',
    description: 'Customized milestone birthdays, baby showers, and anniversary surprises with elegant themed backdrops, balloon installations, mood lighting, and high-energy music.',
    price: '₹25,000',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Custom Thematic Backdrop & Balloon Architecture',
      'High-Definition Candid Photography Coverage',
      'Dynamic Mood Lighting & Audio Rigs',
      'Designer Cake Table & Welcome Hospitality',
      'Dedicated Event Coordinator & Flow Management'
    ],
    detailsLink: '/packages/low'
  }
];

export default function Packages() {
  return (
    <main className="packages-master-page">
      {/* Ambient Parallax Glowing Orbs */}
      <div className="packages-ambient-orb packages-orb-1"></div>
      <div className="packages-ambient-orb packages-orb-2"></div>

      {/* =========================================================================
          HERO HEADER
          ========================================================================= */}
      <section className="packages-hero">
        <div className="packages-hero-badge">
          <span>✦</span>
          <span>Bespoke Celebration Plans</span>
        </div>

        <h1 className="packages-hero-title">
          OUR EVENT <span className="gradient-gold">PACKAGES</span>
        </h1>

        <p className="packages-hero-subtitle">
          Designed for every celebration
        </p>

        <p className="packages-hero-desc">
          From grand monumental weddings and executive corporate summits to vibrant intimate milestone celebrations, select an expertly tailored package orchestrated for perfection.
        </p>
      </section>

      {/* =========================================================================
          3-COLUMN PACKAGES GRID
          ========================================================================= */}
      <section className="packages-grid-section">
        <div className="packages-grid">
          {PACKAGES_DATA.map((pkg) => (
            <article
              key={pkg.id}
              className={`pkg-premium-card ${pkg.tier === 'high' ? 'pkg-featured' : ''}`}
            >
              {/* Large HD Media Header */}
              <div className="pkg-card-media">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="pkg-card-img"
                  loading="lazy"
                />
                <div className="pkg-card-overlay"></div>

                <div className="pkg-card-badge-dock">
                  <span className={`pkg-tier-pill pkg-tier-${pkg.tier}`}>
                    {pkg.tierBadge}
                  </span>
                  <span className="pkg-curation-tag">
                    {pkg.category}
                  </span>
                </div>
              </div>

              {/* Package Details Body */}
              <div className="pkg-card-body">
                <div className="pkg-header-group">
                  <span className="pkg-category-kicker">{pkg.tagline}</span>
                  <h2 className="pkg-title">{pkg.name}</h2>
                  <p className="pkg-desc">{pkg.description}</p>
                </div>

                {/* Price Display */}
                <div className="pkg-price-dock">
                  <span className="pkg-price-label">Starting From</span>
                  <span className="pkg-price-val">{pkg.price}</span>
                </div>

                {/* Features List */}
                <div className="pkg-features-list">
                  {pkg.features.map((feat, fIdx) => (
                    <div key={fIdx} className="pkg-feature-item">
                      <span className="pkg-feature-icon">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* View Details Action Button */}
                <div className="pkg-action-wrap">
                  <Link
                    to={pkg.detailsLink}
                    className="pkg-view-btn"
                    aria-label={`View details for ${pkg.name}`}
                  >
                    <span>VIEW DETAILS</span>
                    <span className="pkg-btn-arrow">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
