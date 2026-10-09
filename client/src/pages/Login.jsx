import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const from = location.state?.from || queryParams.get('from') || queryParams.get('redirect');

  const showToast = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authAPI.login({ username: username.trim(), password });
      if (res.data && res.data.access_token) {
        login(res.data.access_token, res.data.user);
        showToast(`Welcome back, ${res.data.user.first_name || res.data.user.username}!`);
        
        setTimeout(() => {
          if (from) {
            navigate(from);
          } else if (res.data.user.role === 'ADMIN' || res.data.user.role === 'SUPER_ADMIN') {
            navigate('/admin');
          } else {
            navigate('/my-events');
          }
        }, 600);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Invalid username or password';
      showToast(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {msg && <div className="msg-box">{msg}</div>}

      <div className="login-container">
        <h1 className="login-title">Login</h1>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              className="input-field-auth"
              placeholder="Username or email"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              className="input-field-auth"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="links-row">
            <Link to="/forgot-password" className="link-item">
              Forgot password?
            </Link>
            <Link to="/register" state={{ from }} className="link-item">
              Register
            </Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
