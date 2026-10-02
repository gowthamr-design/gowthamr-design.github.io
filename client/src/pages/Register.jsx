import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3500);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (otpSent || otpVerified) {
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const handleSendOTP = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showToast('Please enter your email address first');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showToast('Please enter a valid email address');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await authAPI.sendOTP(trimmedEmail);
      setOtpSent(true);
      setOtpVerified(false);
      showToast(res.data?.message || 'Verification code sent to your email! Please check your inbox.');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to send verification code via email.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    const trimmedOtp = otp.trim();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showToast('Please enter your email address');
      return;
    }
    if (!trimmedOtp) {
      showToast('Please enter the 6-digit verification code');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await authAPI.verifyOTP(trimmedEmail, trimmedOtp);
      setOtpVerified(true);
      showToast(res.data?.message || 'OTP verified successfully!');
    } catch (err) {
      setOtpVerified(false);
      showToast(err.response?.data?.detail || 'Invalid or expired verification code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      showToast('Please send and verify the OTP code before registering.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        age: parseInt(age),
        password,
        confirmPassword,
        otp: otp.trim()
      });

      if (res.data && res.data.access_token) {
        login(res.data.access_token, res.data.user);
        showToast('Registration successful! Welcome to Banana Brothers.');
        setTimeout(() => navigate('/my-events'), 800);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Registration failed. Please try again.';
      showToast(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {msg && <div className="msg-box">{msg}</div>}

      <div className="register-container">
        <h1 className="register-title">Register</h1>

        <form className="auth-form" onSubmit={handleRegister}>
          {/* First Name & Last Name */}
          <div className="two-col-group">
            <div className="input-group">
              <input
                type="text"
                className="input-field-auth"
                placeholder="First name"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                className="input-field-auth"
                placeholder="Last name"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Username */}
          <div className="input-group">
            <input
              type="text"
              className="input-field-auth"
              placeholder="Username"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email with Send OTP */}
          <div className="input-group">
            <div className="input-with-action">
              <input
                type="email"
                className="input-field-auth"
                placeholder="Email address"
                required
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
              />
              <button
                type="button"
                className="action-btn"
                onClick={handleSendOTP}
                disabled={sendingOtp}
              >
                {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* OTP with Verify */}
          <div className="input-group">
            <div className="input-with-action">
              <input
                type="text"
                className="input-field-auth"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={otpVerified}
              />
              <button
                type="button"
                className="action-btn"
                onClick={handleVerifyOTP}
                disabled={verifyingOtp || otpVerified}
              >
                {verifyingOtp ? 'Verifying...' : otpVerified ? '✓ Verified' : 'Verify'}
              </button>
            </div>
          </div>

          {/* Age */}
          <div className="input-group">
            <input
              type="number"
              className="input-field-auth"
              placeholder="Age"
              min="1"
              max="120"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <input
              type="password"
              className="input-field-auth"
              placeholder="Password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <input
              type="password"
              className="input-field-auth"
              placeholder="Confirm password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Link Row */}
          <div className="links-row">
            <Link to="/login" className="link-item">
              Already have an account? Login
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
