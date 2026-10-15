import React from 'react';
import BookingConfigurator from '../components/BookingConfigurator';

const HIGH_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
];

export default function HighBooking() {
  return (
    <BookingConfigurator
      tier="high"
      badgeText="High Package"
      basePrice={150000}
      images={HIGH_IMAGES}
    />
  );
}
