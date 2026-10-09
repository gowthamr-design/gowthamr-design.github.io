import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';

const DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
  'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
  'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
  'Viluppuram', 'Virudhunagar'
];

const FUNCTION_TYPES = [
  { value: 'wedding', label: 'Wedding (Thirumanam)' },
  { value: 'reception', label: 'Reception' },
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'engagement', label: 'Engagement / Ring Ceremony' },
  { value: 'seemantham', label: 'Seemantham / Baby Shower' },
  { value: 'earpiercing', label: 'Ear Piercing (Kadhukuthu)' },
  { value: 'puberty', label: 'Puberty Function (Manjal Neerattu Vizha)' },
  { value: 'housewarming', label: 'Housewarming (Grahapravesam)' },
  { value: 'anniversary', label: 'Anniversary Celebration' },
  { value: 'corporate', label: 'Corporate Gala & Conference' }
];

const NEEDS_LIST = [
  { name: 'Food', price: 40000 },
  { name: 'Catering', price: 25000 },
  { name: 'Decorations', price: 35000 },
  { name: 'Cosmetics', price: 15000 },
  { name: 'DJ Music', price: 20000 },
  { name: 'Photography', price: 30000 },
  { name: 'Videography', price: 35000 },
  { name: 'Lighting', price: 15000 }
];

export default function BookingConfigurator({ tier, badgeText, basePrice, images }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const step2Ref = useRef(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [altMobileNo, setAltMobileNo] = useState('');
  const [emailAddr, setEmailAddr] = useState('');
  const [functionType, setFunctionType] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState([]);

  // Auto-fill user profile info if logged in
  useEffect(() => {
    if (user) {
      const computedName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.name || user.username || '';
      setFullName((prev) => prev || computedName);
      if (user.email) {
        setEmailAddr((prev) => prev || user.email);
      }
      if (user.phone) {
        setMobileNo((prev) => prev || user.phone);
      }
    }
  }, [user]);

  // Step 2 states
  const [isStep2Active, setIsStep2Active] = useState(false);
  const [district, setDistrict] = useState('');
  const [place, setPlace] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [mapLocation, setMapLocation] = useState('');

  // Total price state
  const [totalPrice, setTotalPrice] = useState(basePrice);
  const [submitting, setSubmitting] = useState(false);

  // Calculate total whenever needs, fromDate, or toDate change
  useEffect(() => {
    let total = basePrice;
    selectedNeeds.forEach((item) => {
      total += item.price;
    });

    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 1) {
        total = total * diffDays;
      }
    }

    setTotalPrice(total);
  }, [selectedNeeds, fromDate, toDate, basePrice]);

  // If still checking authentication, show elegant loading state
  if (authLoading) {
    return (
      <div className="booking-page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#D4AF37', fontSize: '1.1rem', letterSpacing: '0.05em' }}>Loading booking portal...</div>
      </div>
    );
  }

  // If unauthenticated, redirect immediately to login before rendering form
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const handleNeedToggle = (need) => {
    if (selectedNeeds.some((n) => n.name === need.name)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n.name !== need.name));
    } else {
      setSelectedNeeds([...selectedNeeds, need]);
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setIsStep2Active(true);
    setTimeout(() => {
      if (step2Ref.current) {
        step2Ref.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      package_tier: tier,
      fullName,
      mobileNo,
      altMobileNo: altMobileNo || undefined,
      emailAddr,
      functionType,
      needs: selectedNeeds.map((n) => n.name),
      districtSelect: district,
      place,
      fullAddress,
      pincode,
      fromDate,
      toDate,
      fromTime,
      toTime,
      mapLocation,
      estimatedAmount: totalPrice
    };

    try {
      const res = await bookingAPI.create(payload);
      alert(`Your ${tier.toUpperCase()} Package Order has been placed successfully!\nReference: ${res.data.booking_reference}\nEstimated Amount: ₹ ${totalPrice.toLocaleString('en-IN')}`);
      navigate('/my-events');
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Your session has expired or authentication is required. Please log in.');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      const msg = err.response?.data?.detail || 'Failed to place booking. Please try again.';
      alert(`Booking submission error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page-container">
      {/* 1. Header Section */}
      <header className="page-header">
        <span className="badge">{badgeText}</span>
        <h1 className="main-title">Event Booking</h1>
        <p className="subtitle">Complete custom package selection by Banana Brothers</p>
      </header>

      {/* 2. Scrolling Image Gallery */}
      <div className="slider-wrapper">
        <div className="slider-track">
          {images.map((imgSrc, idx) => (
            <img key={idx} src={imgSrc} alt={`${badgeText} preview ${idx + 1}`} />
          ))}
        </div>
      </div>

      {/* 3. Form Content */}
      <div className="form-card" id="step1Card">
        <h2 className="form-section-title">Personal &amp; Event Requirements</h2>

        <form id="formStep1" onSubmit={handleStep1Submit}>
          <div className="form-grid">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                className="input-field"
                placeholder="Enter full name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Mobile No */}
            <div className="form-group">
              <label htmlFor="mobileNo">Mobile No *</label>
              <input
                type="tel"
                id="mobileNo"
                className="input-field"
                placeholder="Enter 10-digit number"
                required
                pattern="[0-9]{10}"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
              />
            </div>

            {/* Alternative No */}
            <div className="form-group">
              <label htmlFor="altMobileNo">Alternative No (Optional)</label>
              <input
                type="tel"
                id="altMobileNo"
                className="input-field"
                placeholder="Optional phone number"
                value={altMobileNo}
                onChange={(e) => setAltMobileNo(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="emailAddr">Email Address *</label>
              <input
                type="email"
                id="emailAddr"
                className="input-field"
                placeholder="Enter email address"
                required
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
              />
            </div>

            {/* Function Category Dropdown */}
            <div className="form-group full-width">
              <label htmlFor="functionType">Function Category (Type) *</label>
              <select
                id="functionType"
                className="input-field"
                required
                value={functionType}
                onChange={(e) => setFunctionType(e.target.value)}
              >
                <option value="" disabled>
                  Select event type...
                </option>
                {FUNCTION_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Services Checkboxes */}
            <div className="form-group full-width">
              <label>Select Required Services (Needs):</label>
              <div className="needs-grid">
                {NEEDS_LIST.map((need) => {
                  const isChecked = selectedNeeds.some((n) => n.name === need.name);
                  return (
                    <label key={need.name} className="checkbox-card">
                      <input
                        type="checkbox"
                        name="needs"
                        checked={isChecked}
                        onChange={() => handleNeedToggle(need)}
                      />
                      <span>{need.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Amount Display */}
          <div className="price-summary-box">
            <span className="price-label">Estimated Base Amount:</span>
            <span className="price-amount" id="totalPriceDisplay">
              ₹ {totalPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <button type="submit" className="btn-submit">
            Next Step &rarr;
          </button>
        </form>
      </div>

      {/* STEP 2: Venue, Location & Date Range */}
      <div
        ref={step2Ref}
        className="form-card"
        id="step2Container"
        style={{ display: isStep2Active ? 'block' : 'none' }}
      >
        <h2 className="form-section-title">Venue &amp; Date/Time Details</h2>

        <form id="formStep2" onSubmit={handleFinalSubmit}>
          <div className="form-grid">
            {/* District Dropdown */}
            <div className="form-group">
              <label htmlFor="districtSelect">District (Tamil Nadu) *</label>
              <select
                id="districtSelect"
                className="input-field"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="" disabled>
                  Select District...
                </option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Place */}
            <div className="form-group">
              <label htmlFor="place">Place / Area *</label>
              <input
                type="text"
                id="place"
                className="input-field"
                placeholder="e.g. T. Nagar"
                required
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
            </div>

            {/* Full Address */}
            <div className="form-group full-width">
              <label htmlFor="fullAddress">Full Address (Hall/Venue) *</label>
              <input
                type="text"
                id="fullAddress"
                className="input-field"
                placeholder="Door No, Street name, Marriage hall name..."
                required
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
              />
            </div>

            {/* Pincode */}
            <div className="form-group full-width">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                className="input-field"
                placeholder="6-digit pincode"
                required
                pattern="[0-9]{6}"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>

            {/* From Date & To Date */}
            <div className="form-group">
              <label htmlFor="fromDate">From Date *</label>
              <input
                type="date"
                id="fromDate"
                className="input-field"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="toDate">To Date *</label>
              <input
                type="date"
                id="toDate"
                className="input-field"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* From Time & To Time */}
            <div className="form-group">
              <label htmlFor="fromTime">From Time *</label>
              <input
                type="time"
                id="fromTime"
                className="input-field"
                required
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="toTime">To Time *</label>
              <input
                type="time"
                id="toTime"
                className="input-field"
                required
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
              />
            </div>

            {/* Location Link */}
            <div className="form-group full-width">
              <label htmlFor="mapLocation">Google Map Location Link *</label>
              <input
                type="url"
                id="mapLocation"
                className="input-field"
                placeholder="Paste Google Map link (https://maps.google.com/...)"
                required
                value={mapLocation}
                onChange={(e) => setMapLocation(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" style={{ marginTop: '10px' }} disabled={submitting}>
            {submitting ? 'PROCESSING ORDER...' : 'BOOK YOUR ORDER NOW'}
          </button>
        </form>
      </div>
    </div>
  );
}
