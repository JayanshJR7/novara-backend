import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'
const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState('next');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const progressRef = useRef(null);


  const navigate = useNavigate();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
  try {
    const { data } = await api.get('/carousel/slides');

    if (data?.success && Array.isArray(data.slides) && data.slides.length > 0) {
      setSlides(data.slides);
    } else {
      setSlides(getFallbackSlides());
    }
  } catch (error) {
    console.error('Failed to fetch slides:', error);
    setSlides(getFallbackSlides());
  } finally {
    setLoading(false);
  }
};

const getFallbackSlides = () => ([
  {
    id: 1,
    title: 'Exquisite Silver Collection',
    subtitle: 'Discover timeless elegance crafted with precision'
  },
  {
    id: 2,
    title: 'Handcrafted Perfection',
    subtitle: 'Each piece tells a story of artistry'
  },
  {
    id: 3,
    title: 'Wedding Special',
    subtitle: 'Make your day unforgettable with our collection'
  }
]);


  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setDirection('next');
      setIsTransitioning(true);

      setCurrentSlide(prev => (prev + 1) % slides.length);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setDirection('next');
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setDirection('prev');
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setDirection(index > currentSlide ? 'next' : 'prev');
    setIsTransitioning(true);
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  if (loading || slides.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
      </div>
    );
  }

  return (
    <div style={styles.carousel}>
      <div style={styles.backgroundGradient}></div>

      <div style={styles.carouselInner}>
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide._id || slide.id}
              style={{
                ...styles.carouselSlide,
                opacity: isActive ? 1 : 0,
                transform: isActive
                  ? 'scale(1) translateX(0)'
                  : direction === 'next'
                    ? 'scale(0.9) translateX(-100px)'
                    : 'scale(0.9) translateX(100px)',
                zIndex: isActive ? 2 : 1,
              }}
            >
              <div style={styles.imageWrapper}>
                <img
                  src={slide.image || '/images/LOGO.png'}
                  loading='lazy'
                  alt={slide.title}
                  style={{
                    ...styles.carouselImage,
                    transform: isActive ? 'scale(1)' : 'scale(1.1)',
                  }}
                />

                <div style={styles.carouselOverlay}>
                  <div style={styles.decorativeCircle1}></div>
                  <div style={styles.decorativeCircle2}></div>
                  <div style={styles.decorativeLine}></div>
                </div>
              </div>

              <div style={styles.contentWrapper}>
                <div style={styles.carouselContent}>
                  <div style={{
                    ...styles.ornamentTop,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                  }}>✦</div>

                  <h2 style={{
                    ...styles.title,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(30px)',
                  }}>
                    {slide.title}
                  </h2>

                  <p style={{
                    ...styles.subtitle,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(30px)',
                  }}>
                    {slide.subtitle}
                  </p>

                  <button style={{
                    ...styles.ctaButton,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(30px)',
                  }}
                    onClick={() => navigate('/products')}
                  >
                    <span style={styles.ctaText}>Explore Collection</span>
                    <span style={styles.ctaArrow}>→</span>
                  </button>

                  <div style={{
                    ...styles.ornamentBottom,
                    opacity: isActive ? 1 : 0,
                  }}>
                    <span style={styles.ornamentLine}></span>
                    <span style={styles.ornamentDiamond}>◆</span>
                    <span style={styles.ornamentLine}></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button
          style={styles.controlPrev}
          onClick={prevSlide}
          disabled={isTransitioning}
        >
          <div style={styles.controlInner}>
            <FiChevronLeft style={styles.controlIcon} />
          </div>
        </button>

        <button
          style={styles.controlNext}
          onClick={nextSlide}
          disabled={isTransitioning}
        >
          <div style={styles.controlInner}>
            <FiChevronRight style={styles.controlIcon} />
          </div>
        </button>

        <div style={styles.dotsContainer}>
          <div style={styles.dotsWrapper}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  ...styles.dot,
                  ...(index === currentSlide ? styles.dotActive : {}),
                }}
                disabled={isTransitioning}
              >
                {index === currentSlide && (
                  <div
                    ref={index === currentSlide ? progressRef : null}
                    style={styles.dotProgress}
                  ></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.scrollIndicator}>
          <div style={styles.scrollLine}></div>
          <span style={styles.scrollText}>Scroll</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap');

        @keyframes gradientMove {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10%, 10%) rotate(90deg); }
          50% { transform: translate(0, 20%) rotate(180deg); }
          75% { transform: translate(-10%, 10%) rotate(270deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes slideProgress {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes scrollMove {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }

        @keyframes decorFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(30px, -30px) scale(1.2); opacity: 0.5; }
        }

        @keyframes decorFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(-40px, 40px) scale(1.3); opacity: 0.4; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cta-button:hover .cta-arrow {
          transform: translateX(5px);
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(48, 7, 8, 0.4);
        }

        .control-inner:hover {
          transform: scale(1.1);
        }

        @media (max-width: 968px) {
          .carousel-content h2 {
            font-size: 3rem !important;
          }
          .carousel-content p {
            font-size: 1.1rem !important;
          }
        }

        @media (max-width: 576px) {
          .carousel-content h2 {
            font-size: 2rem !important;
          }
          .carousel-content p {
            font-size: 1rem !important;
          }
          .cta-button {
            padding: 12px 24px !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </div>
  );
};

// Styles object remains the same as before
const styles = {
  carousel: {
    position: 'relative',
    width: '100%',
    height: '90vh',
    minHeight: '700px',
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
  },
  backgroundGradient: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(139, 69, 19, 0.15) 0%, transparent 70%)',
    animation: 'gradientMove 20s ease-in-out infinite',
    pointerEvents: 'none',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    minHeight: '700px',
    backgroundColor: '#0a0a0a',
  },
  loader: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(139, 69, 19, 0.2)',
    borderTop: '4px solid #8B4513',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  carouselInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  carouselSlide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 8s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  carouselOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to right, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.2) 100%)',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: '20%',
    right: '15%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    border: '2px solid rgba(139, 69, 19, 0.3)',
    animation: 'decorFloat1 8s ease-in-out infinite',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: '15%',
    right: '25%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: '1px solid rgba(139, 69, 19, 0.2)',
    animation: 'decorFloat2 10s ease-in-out infinite',
  },
  decorativeLine: {
    position: 'absolute',
    top: '50%',
    right: '10%',
    width: '200px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.5), transparent)',
    transform: 'translateY(-50%) rotate(-45deg)',
  },
  contentWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    zIndex: 3,
  },
  carouselContent: {
    maxWidth: '700px',
    padding: '0 4rem',
    color: 'white',
  },
  ornamentTop: {
    fontSize: '28px',
    color: '#8B4513',
    marginBottom: '20px',
    animation: 'float 3s ease-in-out infinite',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
  },
  title: {
    fontFamily: "'Dancing Script', cursive",
    fontSize: '5rem',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 1.5rem 0',
    lineHeight: 1.2,
    textShadow: '3px 3px 10px rgba(0, 0, 0, 0.5)',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
  },
  subtitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 300,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '2.5rem',
    letterSpacing: '0.5px',
    lineHeight: 1.6,
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 36px',
    background: 'linear-gradient(135deg, #8B4513 0%, #654321 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.5s',
    boxShadow: '0 6px 20px rgba(139, 69, 19, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaText: {
    position: 'relative',
    zIndex: 2,
  },
  ctaArrow: {
    fontSize: '20px',
    transition: 'transform 0.3s ease',
    position: 'relative',
    zIndex: 2,
  },
  ornamentBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginTop: '3rem',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s',
  },
  ornamentLine: {
    width: '60px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.8), transparent)',
  },
  ornamentDiamond: {
    fontSize: '12px',
    color: '#8B4513',
    animation: 'pulse 2s ease-in-out infinite',
  },
  controlPrev: {
    position: 'absolute',
    left: '2rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 10,
    padding: 0,
  },
  controlNext: {
    position: 'absolute',
    right: '2rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 10,
    padding: 0,
  },
  controlInner: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  controlIcon: {
    fontSize: '28px',
    color: '#fff',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: '3rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    zIndex: 10,
  },
  dotsWrapper: {
    display: 'flex',
    gap: '12px',
  },
  dot: {
    position: 'relative',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.4s ease',
    padding: 0,
    overflow: 'hidden',
  },
  dotActive: {
    width: '40px',
    borderRadius: '10px',
    background: 'rgba(139, 69, 19, 0.5)',
  },
  dotProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    background: 'linear-gradient(90deg, #8B4513, #654321)',
    animation: 'slideProgress 5s linear',
    borderRadius: '10px',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '3rem',
    right: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    zIndex: 10,
  },
  scrollLine: {
    width: '2px',
    height: '40px',
    background: 'linear-gradient(to bottom, transparent, rgba(139, 69, 19, 0.8))',
    position: 'relative',
    overflow: 'hidden',
  },
  scrollText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '12px',
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    writingMode: 'vertical-rl',
    animation: 'scrollMove 2s ease-in-out infinite',
  },
};

export default HeroCarousel;