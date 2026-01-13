import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .luxury-login-page {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f5f0e8 0%, #faf8f4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          position: relative;
          overflow: hidden;
        }

        .luxury-login-page::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(139, 69, 19, 0.03) 0%, transparent 70%);
          animation: rotate 30s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-container {
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
        }

        .login-box {
          background: #ffffff;
          border-radius: 2px;
          box-shadow: 0 10px 40px rgba(139, 69, 19, 0.08);
          position: relative;
          overflow: hidden;
        }

        .gold-accent-top {
          height: 3px;
          background: linear-gradient(90deg, #8B4513 0%, #D4AF37 50%, #8B4513 100%);
        }

        .login-inner {
          padding: 60px 50px;
        }

        .brand-section {
          text-align: center;
          margin-bottom: 45px;
        }

        .logo-placeholder {
          width: 70px;
          height: 70px;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon {
          width: 100%;
          height: 100%;
          color: #8B4513;
        }

        .welcome-title {
          font-size: 32px;
          font-weight: 400;
          color: #2c1810;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .welcome-subtitle {
          font-size: 15px;
          color: #8B7355;
          font-weight: 300;
          letter-spacing: 0.5px;
        }

        .divider-ornament {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
          margin: 25px auto;
        }

        .error-message {
          background: #fef2f2;
          border-left: 3px solid #b91c1c;
          padding: 14px 18px;
          margin-bottom: 30px;
          border-radius: 2px;
        }

        .error-text {
          color: #991b1b;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
        }

        .login-form {
          margin-top: 35px;
        }

        .form-field {
          margin-bottom: 28px;
        }

        .field-label {
          display: block;
          font-size: 13px;
          color: #5c4a3a;
          margin-bottom: 10px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }

        .field-input {
          width: 100%;
          padding: 14px 18px;
          border: 1px solid #ddd0c0;
          background: #fafaf8;
          font-size: 15px;
          color: #2c1810;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          border-radius: 2px;
        }

        .field-input:focus {
          outline: none;
          border-color: #8B4513;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.06);
        }

        .field-input::placeholder {
          color: #b4a593;
        }

        .password-field {
          position: relative;
        }

        .forgot-password-row {
          text-align: right;
          margin-bottom: 32px;
        }

        .forgot-link {
          color: #8B4513;
          font-size: 13px;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.3px;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #5c2d0a;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #8B4513 0%, #6d3410 100%);
          color: #ffffff;
          border: none;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          border-radius: 2px;
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .submit-button:hover::before {
          left: 100%;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 69, 19, 0.3);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .footer-divider {
          margin: 40px 0 30px;
          text-align: center;
          position: relative;
        }

        .footer-divider::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ddd0c0, transparent);
        }

        .divider-text {
          position: relative;
          display: inline-block;
          background: #ffffff;
          padding: 0 20px;
          font-size: 12px;
          color: #8B7355;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }

        .register-section {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #f0e8dc;
        }

        .register-text {
          color: #5c4a3a;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
        }

        .register-link {
          color: #8B4513;
          text-decoration: none;
          font-weight: 600;
          margin-left: 6px;
          transition: color 0.2s;
        }

        .register-link:hover {
          color: #5c2d0a;
        }

        .gold-accent-bottom {
          height: 3px;
          background: linear-gradient(90deg, #8B4513 0%, #D4AF37 50%, #8B4513 100%);
        }

        @media (max-width: 768px) {
          .login-inner {
            padding: 45px 30px;
          }

          .welcome-title {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="luxury-login-page">
        <div className="login-container">
          <div className="login-box">
            <div className="gold-accent-top"></div>
            
            <div className="login-inner">
              <div className="brand-section">
                <div className="logo-placeholder">
                  <svg className="logo-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" 
                          strokeWidth="2" fill="none"/>
                    <circle cx="50" cy="50" r="8" fill="currentColor"/>
                  </svg>
                </div>
                
                <h1 className="welcome-title">Welcome Back</h1>
                <p className="welcome-subtitle">Access Your Exclusive Collection</p>
                <div className="divider-ornament"></div>
              </div>

              {error && (
                <div className="error-message">
                  <p className="error-text">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-field">
                  <label className="field-label" htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="field-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-field password-field">
                  <label className="field-label" htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="field-input"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="forgot-password-row">
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </Link>
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  <div className="button-content">
                    {loading && <div className="spinner"></div>}
                    <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                  </div>
                </button>
              </form>

              <div className="footer-divider">
                <span className="divider-text">New to Novara?</span>
              </div>

              <div className="register-section">
                <span className="register-text">
                  Create an account to explore our curated collection
                </span>
                <Link to="/register" className="register-link">Register Now</Link>
              </div>
            </div>

            <div className="gold-accent-bottom"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;