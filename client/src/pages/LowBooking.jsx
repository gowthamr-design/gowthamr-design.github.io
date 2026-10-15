import React from 'react';
import BookingConfigurator from '../components/BookingConfigurator';

const LOW_IMAGES = [
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80'
];

export default function LowBooking() {
  return (
    <BookingConfigurator
      tier="low"
      badgeText="Low Package"
      basePrice={30000}
      images={LOW_IMAGES}
    />
  );
}
