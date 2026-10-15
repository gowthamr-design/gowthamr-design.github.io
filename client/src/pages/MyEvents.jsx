import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_EVENTS = [
  {
    id: 1,
    title: 'Grand Royal Wedding',
    date: '15 Nov 2026',
    location: 'Chennai, Tamil Nadu',
    description: 'Full traditional wedding setup with imported floral backdrop, cinematic 4K videography, and lavish multi-course feast.',
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    status: 'UPCOMING',
    status_class: 'status-upcoming',
    booking_reference: 'BB-2026-DEMO1'
  },
  {
    id: 2,
    title: 'Corporate Annual Gala',
    date: '02 Dec 2026',
    location: 'Coimbatore, Tamil Nadu',
    description: 'Executive conference setup with high-end audio-visual systems, ambient lighting, and executive catering buffet.',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    status: 'UPCOMING',
    status_class: 'status-upcoming',
    booking_reference: 'BB-2026-DEMO2'
  },
  {
    id: 3,
    title: '1st Birthday Celebration',
    date: '24 Aug 2026',
    location: 'Madurai, Tamil Nadu',
    description: 'Themed balloon arch decorations, custom cake table arrangement, sound system, and fun entertainment activities.',
    image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    status: 'COMPLETED',
    status_class: 'status-completed',
    booking_reference: 'BB-2026-DEMO3'
  }
];

const mapEventStatusClass = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'COMPLETED') return 'status-completed';
  if (s === 'CANCELLED') return 'status-cancelled';
  return 'status-upcoming';
};

export default function MyEvents() {
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, setToast] = useState({ text: '', type: 'success' });
  const { user } = useAuth();

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    bookingAPI.getMyEvents()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((item) => ({
            ...item,
            status_class: mapEventStatusClass(item.status)
          }));
          setEvents(mapped);
        }
      })
      .catch(() => {
        // Fallback to default events
        setEvents(DEFAULT_EVENTS);
      });
  }, [user]);

  const handleCancelBooking = async (ev) => {
    const identifier = ev.id || ev.booking_reference;
    const refDisplay = ev.booking_reference || `#${ev.id}`;
    const confirmed = window.confirm(
      `Are you sure you want to cancel your booking for "${ev.title || 'this event'}" (${refDisplay})?`
    );
    if (!confirmed) return;

    setCancellingId(identifier);
    try {
      const res = await bookingAPI.cancelBooking(identifier);
      const successMessage = res.data?.message || 'Booking has been cancelled successfully.';
      showToast(successMessage, 'success');

      setEvents((prev) =>
        prev.map((item) => {
          const isMatch =
            (ev.id && item.id === ev.id) ||
            (ev.booking_reference && item.booking_reference === ev.booking_reference);
          if (isMatch) {
            return {
              ...item,
              status: 'CANCELLED',
              status_class: 'status-cancelled'
            };
          }
          return item;
        })
      );

      setSelectedEvent((prev) => {
        if (!prev) return null;
        const isMatch =
          (ev.id && prev.id === ev.id) ||
          (ev.booking_reference && prev.booking_reference === ev.booking_reference);
        if (isMatch) {
          return {
            ...prev,
            status: 'CANCELLED',
            status_class: 'status-cancelled'
          };
        }
        return prev;
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || 'Failed to cancel booking. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="events-container">
      {/* Header Section */}
      <div className="header-container">
        <span className="badge">Your Bookings</span>
        <h1 className="main-title">My Events</h1>
        <p className="subtitle">
          View and manage all your booked events, active schedules, and past celebrations.
        </p>
      </div>

      {/* Status Feedback Toast */}
      {toast.text && (
        <div
          role="status"
          style={{
            maxWidth: '650px',
            margin: '0 auto 24px auto',
            padding: '12px 20px',
            borderRadius: '10px',
            background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.22)' : 'rgba(34, 197, 94, 0.22)',
            border: `1px solid ${toast.type === 'error' ? '#EF4444' : '#22C55E'}`,
            color: '#FFF4DC',
            fontSize: '0.92rem',
            fontWeight: '600',
            textAlign: 'center',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)'
          }}
        >
          {toast.text}
        </div>
      )}

      {/* Grid - 3 Cards per Line */}
      <div className="events-grid">
        {events.map((ev) => {
          const isEligibleForCancel =
            Boolean(user) && (ev.status || '').toUpperCase() === 'UPCOMING';
          const cardId = ev.id || ev.booking_reference;

          return (
            <div className="event-card" key={cardId}>
              <div className="card-image-wrap">
                <img
                  src={ev.image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'}
                  alt={ev.title}
                  className="card-image"
                />
                <span className={`status-tag ${ev.status_class || mapEventStatusClass(ev.status)}`}>
                  {ev.status || 'UPCOMING'}
                </span>
              </div>
              <div className="service-card-body">
                <span className="event-date">📅 {ev.date}</span>
                <h3 className="service-card-title">{ev.title}</h3>
                <p className="service-card-desc">{ev.description}</p>
                <div className="service-card-footer">
                  <span className="location-info">📍 {ev.location}</span>
                  <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                    {isEligibleForCancel && (
                      <button
                        type="button"
                        className="cancel-btn"
                        disabled={cancellingId === cardId}
                        onClick={() => handleCancelBooking(ev)}
                      >
                        {cancellingId === cardId ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="view-btn"
                      onClick={() => setSelectedEvent(ev)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(26, 8, 8, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            style={{
              background: 'rgba(42, 5, 13, 0.96)',
              border: '1px solid rgba(217, 164, 65, 0.35)',
              borderRadius: '18px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              color: '#FFF4DC'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFF4DC', fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}>{selectedEvent.title}</h3>
              <span style={{
                background: selectedEvent.status === 'COMPLETED'
                  ? 'rgba(34, 197, 94, 0.22)'
                  : selectedEvent.status === 'CANCELLED'
                  ? 'rgba(239, 68, 68, 0.22)'
                  : 'rgba(217, 164, 65, 0.22)',
                color: selectedEvent.status === 'COMPLETED'
                  ? '#4ADE80'
                  : selectedEvent.status === 'CANCELLED'
                  ? '#FCA5A5'
                  : '#FFC400',
                border: `1px solid ${
                  selectedEvent.status === 'COMPLETED'
                    ? '#22C55E'
                    : selectedEvent.status === 'CANCELLED'
                    ? '#EF4444'
                    : '#D9A441'
                }`,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: '750'
              }}>
                {selectedEvent.status}
              </span>
            </div>

            {selectedEvent.booking_reference && (
              <div style={{ marginBottom: '16px', fontSize: '0.86rem', color: '#FFF4DC' }}>
                Booking Ref: <strong style={{ color: '#FFC400', fontFamily: 'monospace', background: 'rgba(217, 164, 65, 0.14)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(217, 164, 65, 0.3)' }}>{selectedEvent.booking_reference}</strong>
              </div>
            )}

            <div style={{ background: 'rgba(26, 8, 8, 0.85)', padding: '14px 16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid rgba(217, 164, 65, 0.22)' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#FFF4DC' }}>
                <strong style={{ color: '#FFC400' }}>📅 Date:</strong> {selectedEvent.date}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#FFF4DC' }}>
                <strong style={{ color: '#FFC400' }}>📍 Venue / District:</strong> {selectedEvent.location}
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#FFF4DC', lineHeight: 1.55, marginBottom: '20px' }}>
              {selectedEvent.description}
            </p>

            {selectedEvent.total_amount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', padding: '12px 16px', background: 'rgba(217, 164, 65, 0.12)', border: '1px solid rgba(217, 164, 65, 0.3)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.9rem', color: '#FFF4DC' }}>Total Package Amount:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '850', color: '#FFC400' }}>
                  ₹ {Number(selectedEvent.total_amount).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Boolean(user) && (selectedEvent.status || '').toUpperCase() === 'UPCOMING' && (
                <button
                  type="button"
                  className="cancel-btn"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.95rem'
                  }}
                  disabled={cancellingId === (selectedEvent.id || selectedEvent.booking_reference)}
                  onClick={() => handleCancelBooking(selectedEvent)}
                >
                  {cancellingId === (selectedEvent.id || selectedEvent.booking_reference)
                    ? 'Cancelling...'
                    : 'Cancel Booking'}
                </button>
              )}

              <button
                type="button"
                className="view-btn"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', cursor: 'pointer', textAlign: 'center', background: 'var(--gold-pill-gradient)', color: '#2A050D', fontWeight: '800', border: 'none', borderRadius: '8px', boxShadow: '0 4px 15px rgba(255, 196, 0, 0.35)' }}
                onClick={() => setSelectedEvent(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
