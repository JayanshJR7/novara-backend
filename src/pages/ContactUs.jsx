import React, { useState } from 'react';
import './contact.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const mailtoLink = `mailto:thenovarajewels@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    
    window.location.href = mailtoLink;
    setStatus('Opening your email client...');
    
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setStatus('');
    }, 2000);
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <div className="icon-message"></div>
        <h1>Contact Us</h1>
        <p className="subtitle">We'd love to hear from you. Reach out to us through any of the channels below.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-form-section">
          <h2>Get in Touch</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What is this regarding?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Write your message here..."
              />
            </div>

            <button type="submit" className="submit-btn">
              <span className="btn-icon">✉️</span>
              Send Message
            </button>

            {status && <p className="status-message">{status}</p>}
          </form>
        </div>

        <div className="contact-info-section">
          <h2>Other Ways to Reach Us</h2>
          
          <div className="contact-card">
            <div className="card-header">
              <span className="card-icon">📧</span>
              <h3>Email</h3>
            </div>
            <p className="card-main-text">thenovarajewels@gmail.com</p>
            <p className="card-sub-text">We typically respond within 24 hours</p>
          </div>

          <div className="contact-card">
            <div className="card-header">
              <span className="card-icon">📱</span>
              <h3>WhatsApp</h3>
            </div>
            <div className="whatsapp-links">
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noopener noreferrer"
                className="whatsapp-link"
              >
                +91 98765 43210
              </a>
              <a 
                href="https://wa.me/919876543211" 
                target="_blank" 
                rel="noopener noreferrer"
                className="whatsapp-link"
              >
                +91 98765 43211
              </a>
            </div>
            <p className="card-sub-text">Chat with us on WhatsApp for quick responses</p>
          </div>

          <div className="contact-card">
            <div className="card-header">
              <span className="card-icon">📷</span>
              <h3>Instagram</h3>
            </div>
            <a 
              href="https://instagram.com/novara_jewels" 
              target="_blank" 
              rel="noopener noreferrer"
              className="instagram-link"
            >
              @novara_jewels
            </a>
            <p className="card-sub-text">Follow us for latest collections and updates</p>
          </div>

          <div className="business-hours-card">
            <h3>Business Hours</h3>
            <p>Monday - Saturday: 10:00 AM - 7:00 PM</p>
            <p>Sunday: Closed</p>
            <p className="hours-note">We respond to messages during business hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;