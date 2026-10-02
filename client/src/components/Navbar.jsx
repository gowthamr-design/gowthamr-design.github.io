import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Do you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      {/* Brand / Logo */}
      <Link to="/" className="logo">
        <img src="/bb.jpeg" alt="Banana Brothers Logo" />
      </Link>

      {/* Main Navigation Links */}
      <ul className="nav-links">
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
          <Link to="/my-events" className={location.pathname === '/my-events' ? 'active' : ''}>My Events</Link>
        </li>
        {isAdmin && (
          <li>
            <Link
              to="/admin"
              className={location.pathname === '/admin' ? 'active' : ''}
              style={{ color: '#38bdf8', fontWeight: '750' }}
            >
              ★ Admin Panel
            </Link>
          </li>
        )}
      </ul>

      {/* Search Bar and Action Icons */}
      <div className="nav-right">
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
        <Link to="/my-events" className="icon-btn" title="My Booking">
          <svg viewBox="0 0 24 24">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
          </svg>
        </Link>

        {/* User Login Icon or Logged In Username */}
        {user ? (
          <span
            className="user-badge"
            onClick={handleLogout}
            title="Click to Logout"
            style={isAdmin ? { background: 'linear-gradient(135deg, #c53030, #742a2a)', color: '#fff', border: '1px solid rgba(254, 178, 178, 0.4)' } : {}}
          >
            {isAdmin ? `🛡️ Admin (${user.username})` : (user.first_name || user.username || 'User')}
          </span>
        ) : (
          <Link to="/login" className="icon-btn" title="User Login">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </Link>
        )}
      </div>
    </nav>
  );
}
