import React, { useEffect, useRef, useState } from 'react';
import { FaShieldAlt, FaWater, FaSun, FaHandSparkles, FaBox, FaCertificate } from 'react-icons/fa';
import './CareGuide.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const CareGuide = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const careInstructions = [
    {
      icon: <FaWater />,
      title: "Keep Away from Water",
      description: "Remove your silver jewelry before bathing, swimming, or doing dishes. Moisture can cause tarnishing and damage to delicate pieces."
    },
    {
      icon: <FaSun />,
      title: "Avoid Direct Sunlight",
      description: "Store your jewelry away from direct sunlight and heat sources. Prolonged exposure can cause discoloration and weaken the metal."
    },
    {
      icon: <FaHandSparkles />,
      title: "Clean Regularly",
      description: "Gently clean your silver jewelry with a soft, lint-free cloth. For deeper cleaning, use mild soap and warm water, then pat dry immediately."
    },
    {
      icon: <FaBox />,
      title: "Proper Storage",
      description: "Store each piece separately in anti-tarnish bags or lined jewelry boxes. This prevents scratching and reduces exposure to air."
    },
    {
      icon: <FaShieldAlt />,
      title: "Remove During Activities",
      description: "Take off your jewelry during exercise, cleaning, or any strenuous activities to prevent damage and exposure to chemicals."
    }
  ];

  const dosDonts = {
    dos: [
      "Wear your jewelry often - body oils help prevent tarnishing",
      "Put jewelry on last when getting dressed",
      "Use a silver polishing cloth for quick touch-ups",
      "Have your pieces professionally cleaned annually",
      "Check clasps and settings regularly for wear"
    ],
    donts: [
      "Don't expose jewelry to perfumes, lotions, or hairsprays",
      "Don't use harsh chemicals or abrasive cleaners",
      "Don't store jewelry in humid environments",
      "Don't wear jewelry while sleeping",
      "Don't forget to remove jewelry before household chores"
    ]
  };

  return (
    <div className="care-guide-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="care-hero">
        <div className="care-hero-content">
          <h1 className="care-main-title">Jewelry Care Guide</h1>
          <p className="care-subtitle">
            Preserve the beauty and brilliance of your Novara Jewels pieces for generations to come
          </p>
        </div>
      </section>

      <div className="care-container">
        
        {/* Introduction */}
        <section 
          className="care-intro"
          ref={el => sectionRefs.current[0] = el}
        >
          <div className="intro-content">
            <h2 className="section-title">Caring for Your Silver Treasures</h2>
            <p className="intro-text">
              Your silver jewelry is not just an accessory; it's a precious investment that deserves proper care. 
              With the right maintenance, your Novara Jewels pieces will maintain their luster and beauty for years to come. 
              Follow our expert care guide to ensure your jewelry stays as stunning as the day you received it.
            </p>
          </div>
        </section>

        {/* Care Instructions Grid */}
        <section 
          className="care-instructions"
          ref={el => sectionRefs.current[1] = el}
        >
          <h2 className="section-title">Essential Care Tips</h2>
          <div className="instructions-grid">
            {careInstructions.map((instruction, index) => (
              <div 
                key={index} 
                className="instruction-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="instruction-icon">{instruction.icon}</div>
                <h3 className="instruction-title">{instruction.title}</h3>
                <p className="instruction-description">{instruction.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Do's and Don'ts */}
        <section 
          className="dos-donts-section"
          ref={el => sectionRefs.current[2] = el}
        >
          <h2 className="section-title">Do's and Don'ts</h2>
          <div className="dos-donts-grid">
            
            {/* Do's */}
            <div className="dos-card">
              <div className="dos-header">
                <div className="dos-icon">✓</div>
                <h3>Do's</h3>
              </div>
              <ul className="dos-list">
                {dosDonts.dos.map((item, index) => (
                  <li key={index}>
                    <span className="checkmark">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="donts-card">
              <div className="donts-header">
                <div className="donts-icon">✕</div>
                <h3>Don'ts</h3>
              </div>
              <ul className="donts-list">
                {dosDonts.donts.map((item, index) => (
                  <li key={index}>
                    <span className="cross">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Authenticity Certificate */}
        <section 
          className="certificate-section"
          ref={el => sectionRefs.current[4] = el}
        >
          <div className="certificate-header">
            <FaCertificate className="certificate-icon-header" />
            <h2 className="section-title">Certificate of Authenticity</h2>
            <p className="certificate-intro">
              Every piece from Novara Jewels comes with an official Certificate of Authenticity, 
              guaranteeing the quality, purity, and craftsmanship of your jewelry.
            </p>
          </div>

          <div className="certificate-showcase">
            <div className="certificate-card">
              <div className="certificate-image-container">
                <img 
                  src="/images/front.png" 
                  alt="Certificate Front" 
                  className="certificate-image"
                />
                <div className="certificate-overlay">
                  <p>Official Certificate Front</p>
                </div>
              </div>
            </div>

            <div className="certificate-card">
              <div className="certificate-image-container">
                <img 
                  src="/images/back.png" 
                  alt="Certificate Back" 
                  className="certificate-image"
                />
                <div className="certificate-overlay">
                  <p>Official Certificate Back</p>
                </div>
              </div>
            </div>
          </div>

          <div className="certificate-features">
            <h3>What Your Certificate Includes:</h3>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <p>Silver Purity Verification</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <p>Official Company Seal</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <p>Care Instructions</p>
              </div>
            </div>
          </div>
        </section>

        {/* Storage Tips */}
        <section 
          className="storage-tips"
          ref={el => sectionRefs.current[5] = el}
        >
          <h2 className="section-title">Storage Best Practices</h2>
          <div className="storage-content">
            <div className="storage-image">
              <div className="storage-illustration">
                <FaBox size={120} />
              </div>
            </div>
            <div className="storage-text">
              <ul className="storage-list">
                <li>
                  <strong>Individual Storage:</strong> Keep each piece in its own compartment or pouch to prevent scratching.
                </li>
                <li>
                  <strong>Anti-Tarnish Strips:</strong> Use anti-tarnish strips or pouches to slow down the oxidation process.
                </li>
                <li>
                  <strong>Cool & Dry:</strong> Store jewelry in a cool, dry place away from humidity and temperature fluctuations.
                </li>
                <li>
                  <strong>Original Packaging:</strong> When possible, store pieces in their original Novara Jewels packaging.
                </li>
                <li>
                  <strong>Regular Checks:</strong> Inspect stored jewelry every few months and clean if necessary.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Professional Care */}
        <section 
          className="professional-care"
          ref={el => sectionRefs.current[6] = el}
        >
          <div className="professional-content">
            <h2 className="section-title">When to Seek Professional Care</h2>
            <div className="professional-cards">
              <div className="professional-card">
                <h4>Annual Professional Cleaning</h4>
                <p>Have your jewelry professionally cleaned and inspected at least once a year to maintain its beauty and check for any issues.</p>
              </div>
              <div className="professional-card">
                <h4>Repair & Restoration</h4>
                <p>If you notice loose stones, broken clasps, or significant tarnishing, contact us for expert repair services.</p>
              </div>
              <div className="professional-card">
                <h4>Re-plating Services</h4>
                <p>For rhodium-plated pieces, professional re-plating every 1-2 years will restore the original shine and protection.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="care-cta">
          <h2>Need Help with Your Jewelry?</h2>
          <p>Our experts are here to answer any questions about caring for your Novara Jewels pieces.</p>
          <button className="cta-button" onClick={() => navigate('/contact')}>Contact Us</button>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default CareGuide;