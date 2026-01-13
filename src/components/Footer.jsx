import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';
import SignatureSection from './SignatureSection';

const Footer = () => {
  const [email, setEmail] = useState('');
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <footer className="elegant-footer">
      <div className="footer-border"></div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-column brand-column">
              <div className="footer-logo">
                <img src="/images/LOGO.PNG" alt="Novara Jewels" />
                <span className="logo-text">NOVARA JEWELS</span>
              </div>
              <p className="brand-tagline">
                ✨ Where Tradition Meets Contemporary Design ✨
              </p>
              <p className="brand-description">
                Discover exquisite craftsmanship in every piece. We bring you authentic silver jewelry that tells your unique story with elegance and sophistication.
              </p>
              <div className="social-links">
                <a 
                  href="https://instagram.com/novara_jewels" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon instagram" 
                  title="Follow us on Instagram"
                >
                  <FaInstagram />
                </a>
                <a 
                  href="https://facebook.com/novarajewels" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon facebook" 
                  title="Like us on Facebook"
                >
                  <FaFacebookF />
                </a>
                <a 
                  href="https://wa.me/8209845088" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon whatsapp" 
                  title="Chat on WhatsApp"
                >
                  <FaWhatsapp />
                </a>
                <a 
                  href="mailto:thenovarajewels@gmail.com"
                  className="social-icon email" 
                  title="Email us"
                >
                  <FaEnvelope />
                </a>
              </div>
            </div>
            {/* Quick Links */}
            <div className="footer-column">
              <h3>Explore</h3>
              <ul className="footer-links">
                <li><Link to="/careguide">Care Guide & authenticity</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="footer-column">
              <h3>Support</h3>
              <ul className="footer-links">
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/return-policy">Returns Policy</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-column">
              <h3>Contact</h3>
              <ul className="contact-info">
                <li>
                  <FaPhone className="contact-icon" />
                  <div>
                    <strong>Call Us</strong>
                    <a href="tel:+919950053900">+91 9950053900</a>
                    <a href="tel:+918107420755">+91 8107420755</a>
                  </div>
                </li>
                <li>
                  <FaWhatsapp className="contact-icon" />
                  <div>
                    <strong>WhatsApp</strong>
                    <a href="https://wa.me/8209845088" target="_blank" rel="noopener noreferrer">Message Us</a>
                  </div>
                </li>
                <li>
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:thenovarajewels@gmail.com">thenovarajewels@gmail.com</a>
                  </div>
                </li>
                <li>
                  <FaMapMarkerAlt className="contact-icon" />
                  <div>
                    <strong>Location</strong>
                    <span>Jodhpur, Rajasthan</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section - Developer Credit */}
      <SignatureSection />

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Novara Jewels | Powered by Divine Enterprises</p>
            </div>
            <div className="legal-links">
              <Link to="/terms-conditions">Terms & Conditions</Link>
            </div>
          </div>
          <div className="payment-security">
            <p>🔒 Secure Payments • 💎 100% Authentic</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;