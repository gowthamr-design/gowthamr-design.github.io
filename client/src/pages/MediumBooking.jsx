import React from 'react';
import BookingConfigurator from '../components/BookingConfigurator';

const MEDIUM_IMAGES = [
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80'
];

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
