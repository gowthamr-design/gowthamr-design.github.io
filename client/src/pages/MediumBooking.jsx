import React from 'react';
import BookingConfigurator from '../components/BookingConfigurator';

const MEDIUM_IMAGES = ['/images (5).jpg', '/images (20).jpg', '/images (16).jpg'];

export default function MediumBooking() {
  return (
    <BookingConfigurator
      tier="medium"
      badgeText="Medium Package"
      basePrice={75000}
      images={MEDIUM_IMAGES}
    />
  );
}
