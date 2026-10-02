import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      showToast('Please verify your OTP code before resetting password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword({
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword
      });
      showToast('Password reset successful! You can now login.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Password reset failed. Please try again.';
      showToast(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {msg && <div className="msg-box">{msg}</div>}

      <div className="forgot-container">
        <h1 className="forgot-title">Forgot Password</h1>

        <form className="auth-form" onSubmit={handleResetPassword}>
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

          {/* New Password */}
          <div className="input-group">
            <input
              type="password"
              className="input-field-auth"
              placeholder="New password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              Remembered password? Login
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
