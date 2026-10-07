import React from 'react';
import BookingConfigurator from '../components/BookingConfigurator';

const HIGH_IMAGES = ['/bg.png', '/images (3).jpg', '/images (23).jpg'];

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
