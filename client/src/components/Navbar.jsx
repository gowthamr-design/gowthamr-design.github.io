import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu automatically on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Do you want to logout?')) {
      logout();
      setMobileMenuOpen(false);
      navigate('/');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getRoleBadgeLabel = () => {
    if (!user) return 'User';
    if (isSuperAdmin) return `👑 Super Admin (${user.username || user.email})`;
    if (isAdmin) return `🛡️ Admin (${user.username || user.email})`;
    return user.first_name || user.username || 'User';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo - LEFT side */}
        <Link to="/" className="logo" onClick={closeMobileMenu} aria-label="Banana Brothers Home">
          <img
            src="/BB_Logo.jpg"
            alt="Banana Brothers Logo"
            width="135"
            height="46"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </Link>

        {/* Main Navigation Links (Desktop) */}
        <ul className="nav-links desktop-nav">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          </li>
          <li>
            <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>Services</Link>
          </li>
          <li>
            <Link to="/packages" className={location.pathname.startsWith('/packages') ? 'active' : ''}>Packages</Link>
          </li>
          <li>
            <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className={`nav-admin-btn ${location.pathname === '/admin' ? 'active' : ''}`}
                title="Open Administrative Dashboard"
              >
                <span>{isSuperAdmin ? '👑' : '🛡️'}</span>
                <span>Admin Panel</span>
              </Link>
            </li>
          )}
        </ul>

        {/* Search Bar and Action Icons (Desktop) */}
        <div className="nav-right desktop-nav">
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 14z" />
              </svg>
            </button>
          </form>

          {/* My Booking Icon */}
          <Link to="/my-events" className="icon-btn" title="My Bookings" aria-label="My Bookings">
            <svg viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
            </svg>
          </Link>

          {/* User Login Icon or Logged In Username Badge */}
          {user ? (
            <button
              type="button"
              className={`user-badge ${isSuperAdmin ? 'super-admin' : isAdmin ? 'admin' : ''}`}
              onClick={handleLogout}
              title={`Logged in as ${getRoleBadgeLabel()} — Click to Logout`}
              aria-label={`Logged in as ${getRoleBadgeLabel()} — Click to Logout`}
            >
              <span className="user-badge-text">{getRoleBadgeLabel()}</span>
            </button>
          ) : (
            <Link to="/login" className="icon-btn" title="User Login" aria-label="User Login">
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button - RIGHT side */}
        <button
          type="button"
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg viewBox="0 0 24 24" className="mobile-toggle-svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="mobile-toggle-svg">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'is-open' : ''}`}>
        <form className="mobile-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="mobile-search-input"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="mobile-search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 14z" />
            </svg>
          </button>
        </form>

        <ul className="mobile-nav-list">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/services" className={location.pathname === '/services' ? 'active' : ''} onClick={closeMobileMenu}>
              Services
            </Link>
          </li>
          <li>
            <Link to="/packages" className={location.pathname.startsWith('/packages') ? 'active' : ''} onClick={closeMobileMenu}>
              Packages
            </Link>
          </li>
          <li>
            <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''} onClick={closeMobileMenu}>
              Gallery
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className={`mobile-admin-link ${location.pathname === '/admin' ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span>{isSuperAdmin ? '👑 Admin Panel' : '🛡️ Admin Panel'}</span>
                <span className="mobile-admin-pill">Portal</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="mobile-nav-footer">
          <Link to="/my-events" className="mobile-footer-link" onClick={closeMobileMenu}>
            <svg viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
            </svg>
            <span>My Bookings</span>
          </Link>

          {user ? (
            <div className="mobile-user-row">
              <span className="mobile-user-name" title={getRoleBadgeLabel()}>
                {getRoleBadgeLabel()}
              </span>
              <button type="button" className="mobile-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="mobile-footer-link mobile-login-btn" onClick={closeMobileMenu}>
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span>Login / Account</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
