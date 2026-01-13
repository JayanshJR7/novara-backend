// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import './Auth.css';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     // Validation
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return;
//     }

//     setLoading(true);

//     try {
//       await register({
//         name: formData.name,
//         email: formData.email,
//         password: formData.password
//       });
//       navigate('/'); // Redirect to home after registration
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-container">
//         <div className="auth-card">
          
//           <div className="auth-header">
//             <h1>Create Account</h1>
//             <p>Sign up to get started</p>
//           </div>

//           {error && (
//             <div className="error-message">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="auth-form">
            
//             <div className="form-group">
//               <label htmlFor="name">Full Name</label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Enter your full name"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="email">Email Address</label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter your email"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Create a password (min 6 characters)"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="confirmPassword">Confirm Password</label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="Confirm your password"
//                 required
//               />
//             </div>

//             <button 
//               type="submit" 
//               className="btn-submit"
//               disabled={loading}
//             >
//               {loading ? 'Creating Account...' : 'Register'}
//             </button>

//           </form>

//           <div className="auth-footer">
//             <p>Already have an account? <Link to="/login">Login here</Link></p>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;





import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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

        .luxury-register-page {
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

        .luxury-register-page::before {
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

        .register-container {
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
        }

        .register-box {
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

        .register-inner {
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

        .register-form {
          margin-top: 35px;
        }

        .form-field {
          margin-bottom: 24px;
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
          margin-top: 32px;
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

        .login-section {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #f0e8dc;
        }

        .login-text {
          color: #5c4a3a;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
        }

        .login-link {
          color: #8B4513;
          text-decoration: none;
          font-weight: 600;
          margin-left: 6px;
          transition: color 0.2s;
        }

        .login-link:hover {
          color: #5c2d0a;
        }

        .gold-accent-bottom {
          height: 3px;
          background: linear-gradient(90deg, #8B4513 0%, #D4AF37 50%, #8B4513 100%);
        }

        .terms-notice {
          text-align: center;
          margin-top: 25px;
          padding: 0 10px;
        }

        .terms-text {
          font-size: 12px;
          color: #8B7355;
          line-height: 1.6;
          font-family: 'Inter', sans-serif;
        }

        .terms-link {
          color: #8B4513;
          text-decoration: none;
          font-weight: 500;
        }

        .terms-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .register-inner {
            padding: 45px 30px;
          }

          .welcome-title {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="luxury-register-page">
        <div className="register-container">
          <div className="register-box">
            <div className="gold-accent-top"></div>
            
            <div className="register-inner">
              <div className="brand-section">
                <div className="logo-placeholder">
                  <svg className="logo-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" 
                          strokeWidth="2" fill="none"/>
                    <circle cx="50" cy="50" r="8" fill="currentColor"/>
                  </svg>
                </div>
                
                <h1 className="welcome-title">Join Novara</h1>
                <p className="welcome-subtitle">Begin Your Journey in Luxury</p>
                <div className="divider-ornament"></div>
              </div>

              {error && (
                <div className="error-message">
                  <p className="error-text">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-field">
                  <label className="field-label" htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="field-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

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
                    placeholder="Create a password (min 6 characters)"
                    required
                  />
                </div>

                <div className="form-field password-field">
                  <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="field-input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div className="terms-notice">
                  <p className="terms-text">
                    By creating an account, you agree to our{' '}
                    <a href="/terms" className="terms-link">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="terms-link">Privacy Policy</a>
                  </p>
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  <div className="button-content">
                    {loading && <div className="spinner"></div>}
                    <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                  </div>
                </button>
              </form>

              <div className="footer-divider">
                <span className="divider-text">Already a Member?</span>
              </div>

              <div className="login-section">
                <span className="login-text">
                  Sign in to access your collection
                </span>
                <Link to="/login" className="login-link">Login Here</Link>
              </div>
            </div>

            <div className="gold-accent-bottom"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;