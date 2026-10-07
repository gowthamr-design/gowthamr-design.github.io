import React from 'react';
import BookingConfigurator from '../components/BookingConfigurator';

const LOW_IMAGES = ['/images (7).jpg', '/images (19).jpg', '/images (4).jpg'];

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
