import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Left Side: About Section */}
        <div className="footer-about">
          <Link to="/" className="footer-brand">
            <img src="/BB_Logo.jpg" alt="Banana Brothers Logo" loading="lazy" decoding="async" width="90" height="90" />
          </Link>
          <p className="footer-about-text">
            Banana Brothers delivers premium event management services, offering tailored packages for corporate functions, grand weddings, and private celebrations with timeless simplicity.
          </p>
          <div className="footer-contact-info">
            <span>📍 Tiruppur, Tamil Nadu, India</span>
            <span>✉️ bananabrothers@gmail.com</span>
            <span>📞 +91 9952805415</span>
          </div>
        </div>

        {/* Right Side: Links Columns */}
        <div className="footer-links-wrapper">
          {/* Column 1: Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">About Us</Link></li>
              <li><Link to="/my-events">My Events</Link></li>
              <li><Link to="/packages">Bookings</Link></li>
            </ul>
          </div>

          {/* Column 2: Services */}
          <div className="footer-column">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services">Wedding Events</Link></li>
              <li><Link to="/services">Corporate Parties</Link></li>
              <li><Link to="/services">Birthday Galas</Link></li>
              <li><Link to="/services">Custom Decor</Link></li>
            </ul>
          </div>

          {/* Column 3: Packages */}
          <div className="footer-column">
            <h4>Packages</h4>
            <ul>
              <li><Link to="/packages/low">Standard Event</Link></li>
              <li><Link to="/packages/medium">Premium Delight</Link></li>
              <li><Link to="/packages/high">Royal Experience</Link></li>
              <li><Link to="/packages">Custom Plan</Link></li>
            </ul>
          </div>

          {/* Column 4: Help & Info */}
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><Link to="#">FAQ</Link></li>
              <li><Link to="#">Help Center</Link></li>
              <li><Link to="#">Terms of Use</Link></li>
              <li><Link to="#">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="footer-bottom">
        <p>&copy; 2026 Banana Brothers. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms &amp; Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
