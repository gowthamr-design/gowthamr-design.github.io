import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import '../styles/admin.css';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    total_bookings: 0,
    total_revenue: 0,
    upcoming_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
    total_customers: 0
  });
  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getBookings(selectedStatus, searchQuery)
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateStatus(bookingId, newStatus);
      setUpdateMsg(`Status updated to ${newStatus}`);
      setTimeout(() => setUpdateMsg(''), 3000);
      loadData();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status. Please try again.');
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
            Please sign in with administrator credentials to manage event operations.
          </p>
          <Link to="/login" className="btn-sm btn-view" style={{ padding: '10px 24px', fontSize: '1rem' }}>
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header Bar */}
      <div className="admin-header">
        <div className="admin-title-group">
          <h1>
            Banana Brothers Operations
            <span className="admin-badge">Admin Portal</span>
          </h1>
          <p>Real-time booking management, order fulfillment, and metrics tracking</p>
        </div>
        {updateMsg && (
          <div style={{ background: 'rgba(56, 161, 105, 0.2)', border: '1px solid #D9A441', color: '#FFC400', padding: '8px 16px', borderRadius: '6px', fontSize: '0.88rem' }}>
            ✓ {updateMsg}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Orders Placed</div>
          <div className="admin-stat-value">{stats.total_bookings}</div>
        </div>
        <div className="admin-stat-card revenue">
          <div className="admin-stat-label">Gross Revenue Value</div>
          <div className="admin-stat-value">₹ {stats.total_revenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="admin-stat-card upcoming">
          <div className="admin-stat-label">Upcoming Executions</div>
          <div className="admin-stat-value">{stats.upcoming_bookings}</div>
        </div>
        <div className="admin-stat-card completed">
          <div className="admin-stat-label">Completed Celebrations</div>
          <div className="admin-stat-value">{stats.completed_bookings}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
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

      {/* Bookings Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="empty-state">
            <p>Loading bookings data...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <h4>No Bookings Found</h4>
            <p>No orders matched your current status and filter criteria.</p>
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
                  <td>
                    <span className="ref-code">{b.booking_reference || `BB-2026-${b.id}`}</span>
                  </td>
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
                      <button
                        className="btn-sm btn-view"
                        onClick={() => setSelectedBooking(b)}
                      >
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Booking Details Modal */}
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
                    <span className={`status-badge ${selectedBooking.status.toLowerCase()}`}>
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
