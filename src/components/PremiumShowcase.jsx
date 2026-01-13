import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

const PremiumShowcase = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [positions, setPositions] = useState([]);
  const [premiumProducts, setPremiumProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ---------------- FETCH FROM BACKEND ---------------- */
  useEffect(() => {
    fetchPremiumProducts();
  }, []);

  const fetchPremiumProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getTrending();
      setPremiumProducts(data.products.slice(0, 20));
    } catch (err) {
      console.error('Failed to fetch premium products:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- POSITIONS LOGIC ---------------- */
  useEffect(() => {
    const generatePositions = () => {
      const isMobile = window.innerWidth < 576;
      const isSmallMobile = window.innerWidth < 450;
      const isTablet = window.innerWidth >= 576 && window.innerWidth < 1024;

      // Small Mobile (< 450px) - 2 columns, tighter spacing
      if (isSmallMobile) {
        return premiumProducts.map((_, i) => ({
          top: `${10 + i * 120}px`,
          left: i % 2 === 0 ? '3%' : '52%',
          size: 'small',
        }));
      }

      // Mobile (450px - 576px) - 2 columns
      if (isMobile) {
        return premiumProducts.map((_, i) => ({
          top: `${15 + i * 140}px`,
          left: i % 2 === 0 ? '5%' : '53%',
          size: i % 3 === 0 ? 'medium' : 'small',
        }));
      }

      // Tablet (576px - 1024px) - 3 columns
      if (isTablet) {
        return premiumProducts.map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          return {
            top: `${8 + row * 45}%`,
            left: `${4 + col * 32}%`,
            size: i % 2 === 0 ? 'medium' : 'small',
          };
        });
      }

      // Desktop - 4-5 per row with varied positioning
      const desktopPositions = [];
      let currentTop = 5;
      
      for (let i = 0; i < 20; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        
        // Vary the size for visual interest
        let size;
        if (i % 5 === 0 || i % 7 === 0) {
          size = 'large';
        } else if (i % 3 === 0) {
          size = 'medium';
        } else {
          size = 'small';
        }

        // Create 4 columns with some offset variation
        const leftPositions = [2, 24, 48, 72];
        const topOffset = row * 40;
        const randomOffset = (col % 2) * 2; // Slight vertical variation

        desktopPositions.push({
          top: `${currentTop + topOffset + randomOffset}%`,
          left: `${leftPositions[col]}%`,
          size: size,
        });
      }

      return desktopPositions;
    };

    setPositions(generatePositions());

    const handleResize = () => setPositions(generatePositions());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [premiumProducts]);

  /* ---------------- HELPERS ---------------- */
  const getSizeStyles = (size) => {
    const width = window.innerWidth;

    // Small Mobile (< 450px)
    if (width < 450) {
      return size === 'medium' || size === 'large'
        ? { width: '155px', height: '190px' }
        : { width: '135px', height: '170px' };
    }

    // Mobile (450px - 576px)
    if (width < 576) {
      return size === 'medium' || size === 'large'
        ? { width: '165px', height: '205px' }
        : { width: '145px', height: '185px' };
    }

    // Tablet (576px - 1024px)
    if (width < 1024) {
      return size === 'medium' || size === 'large'
        ? { width: '200px', height: '250px' }
        : { width: '180px', height: '225px' };
    }

    // Desktop
    if (size === 'large') {
      return { width: '320px', height: '400px' };
    } else if (size === 'medium') {
      return { width: '280px', height: '350px' };
    } else {
      return { width: '240px', height: '300px' };
    }
  };

  const formatPrice = (product) => {
    const price = product.calculatedPrice || product.basePrice || 0;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getImage = (product) =>
    product.itemImage ||
    product.images?.[0] ||
    'https://via.placeholder.com/400x400?text=No+Image';

  if (loading || !premiumProducts.length) return null;

  /* ---------------- UI ---------------- */
  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>
      <div style={styles.meshGradient1}></div>
      <div style={styles.meshGradient2}></div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.luxuryBadge}>SIGNATURE COLLECTION</div>
        <h2 style={styles.title}>Exquisite Treasures</h2>
        <p style={styles.subtitle}>Interact with our masterpieces</p>
      </div>

      {/* Floating Products */}
      <div style={styles.floatingContainer}>
        {premiumProducts.map((product, index) => {
          const position = positions[index] || {};
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={product._id}
              style={{
                ...styles.productFloat,
                ...getSizeStyles(position.size),
                top: position.top,
                left: position.left,
                zIndex: isHovered ? 1000 : 10 + index,
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                filter:
                  hoveredIndex !== null && !isHovered
                    ? 'blur(3px) brightness(0.6)'
                    : 'none',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div style={styles.imageWrapper}>
                <img
                  src={getImage(product)}
                  alt={product.itemname}
                  loading='lazy'
                  style={styles.productImage}
                />

                <div style={{
                  ...styles.gradientOverlay,
                  opacity: isHovered ? 0.9 : 0.7,
                }}></div>

                <div
                  style={{
                    ...styles.hoverContent,
                    opacity: isHovered ? 1 : 0,
                  }}
                >
                  <h3 style={styles.productName}>{product.itemname}</h3>
                  <div style={styles.priceTag}>{formatPrice(product)}</div>
                  <button style={styles.exploreBtn}>Explore →</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(-8px) rotate(-1deg); }
        }

        @keyframes meshMove1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 50px) scale(1.1); }
        }

        @keyframes meshMove2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    height: 'auto',
    background: '#F5F1ED',
    overflow: 'hidden',
    paddingBottom: '100px',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #F5F1ED 0%, #E8DED3 50%, #F5F1ED 100%)',
    opacity: 1,
  },
  meshGradient1: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.64) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'meshMove1 20s ease-in-out infinite',
    filter: 'blur(60px)',
  },
  meshGradient2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'meshMove2 25s ease-in-out infinite',
    filter: 'blur(60px)',
  },
  header: {
    position: 'relative',
    zIndex: 100,
    textAlign: 'center',
    padding: '60px 20px 40px',
  },
  luxuryBadge: {
    display: 'inline-block',
    padding: '10px 30px',
    background: 'rgba(139, 109, 75, 0.1)',
    border: '1px solid rgba(139, 109, 75, 0.3)',
    borderRadius: '30px',
    fontSize: '11px',
    letterSpacing: '3px',
    color: '#8B6D4B',
    marginBottom: '20px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontSize: '70px',
    fontWeight: '400',
    color: '#300708',
    marginBottom: '16px',
    letterSpacing: '2px',
    fontFamily: "'Dancing Script', cursive",
    margin: '0 0 16px 0',
  },
  subtitle: {
    fontSize: '18px',
    color: '#8B6D4B',
    fontWeight: '300',
    letterSpacing: '1px',
    fontStyle: 'italic',
    fontFamily: "'Playfair Display', serif",
    margin: 0,
  },
  floatingContainer: {
    position: 'relative',
    width: '100%',
    minHeight: 'auto',
    padding: '40px 0',
  },
  productFloat: {
    position: 'absolute',
    cursor: 'pointer',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'float 8s ease-in-out infinite',
    willChange: 'transform',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(61, 40, 23, 0.2)',
    border: '1px solid rgba(184, 153, 110, 0.3)',
    background: '#fff',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s ease',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '35%',
    background: 'linear-gradient(180deg, transparent 0%, #862c2dc8 100%)',
    transition: 'opacity 0.4s ease',
    pointerEvents: 'none',
  },
  hoverContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none',
    color: '#fff',
  },
  productName: {
    fontSize: '22px',
    fontWeight: '400',
    marginBottom: '8px',
    fontFamily: "'Playfair Display', serif",
    margin: '0 0 8px 0',
    color: '#fff',
  },
  priceTag: {
    fontSize: '26px',
    fontWeight: '300',
    marginBottom: '16px',
    color: '#B8996E',
    fontFamily: "'Playfair Display', serif",
  },
  exploreBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 28px',
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    borderRadius: '50px',
    color: '#3D2817',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    pointerEvents: 'auto',
    fontFamily: "'Inter', sans-serif",
  },
};

// Enhanced hover effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    [style*="productFloat"]:hover [style*="productImage"] {
      transform: scale(1.1);
    }
    
    [style*="exploreBtn"]:hover {
      background: rgba(255, 255, 255, 1) !important;
      transform: scale(1.05);
      box-shadow: 0 8px 30px rgba(61, 40, 23, 0.3);
    }

    /* Small Mobile (< 450px) */
    @media (max-width: 449px) {
      [style*="title"] {
        font-size: 32px !important;
      }
      [style*="subtitle"] {
        font-size: 13px !important;
      }
      [style*="productName"] {
        font-size: 16px !important;
      }
      [style*="priceTag"] {
        font-size: 20px !important;
      }
      [style*="exploreBtn"] {
        padding: 10px 20px !important;
        font-size: 11px !important;
      }
      [style*="luxuryBadge"] {
        font-size: 9px !important;
        padding: 8px 20px !important;
      }
    }

    /* Mobile (450px - 576px) */
    @media (min-width: 450px) and (max-width: 575px) {
      [style*="title"] {
        font-size: 36px !important;
      }
      [style*="subtitle"] {
        font-size: 14px !important;
      }
      [style*="productName"] {
        font-size: 18px !important;
      }
      [style*="priceTag"] {
        font-size: 22px !important;
      }
    }

    /* Tablet (576px - 1024px) */
    @media (min-width: 576px) and (max-width: 1023px) {
      [style*="title"] {
        font-size: 48px !important;
      }
      [style*="productName"] {
        font-size: 20px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default PremiumShowcase;