import React, { useState, useEffect, useRef } from 'react';
import { productsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
const JewelryShowcase = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  const categoryIcons = ['✦', '○', '◇', '◈', '◉', '◆', '⬡', '⬢', '⬣', '◐', '◑', '◒'];

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();

      // Get all products (limit to 30)
      const productsData = data.products.slice(0, 30);
      setProducts(productsData);
      setFilteredProducts(productsData);

      // Extract unique categories
      const uniqueCategories = [...new Set(data.products.map(p => p.category))];
      const categoryList = uniqueCategories.map((cat, index) => ({
        id: cat,
        label: formatCategoryName(cat),
        icon: categoryIcons[index % categoryIcons.length]
      }));

      // Add "All Treasures" at the beginning
      setCategories([
        { id: 'all', label: 'All Treasures', icon: '✦' },
        ...categoryList
      ]);

    } catch (err) {
      console.error('Failed to fetch products and categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (category) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p =>
        p.category?.toLowerCase().includes(categoryId.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const formatPrice = (product) => {
    const price = product.calculatedPrice || product.basePrice || 0;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getImage = (product) =>
    product.itemImage ||
    product.images?.[0] ||
    'https://via.placeholder.com/400x500?text=No+Image';

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} style={styles.container}>
      {/* Animated Background */}
      <div style={styles.backgroundWrapper}>
        <div style={styles.gradientOrb1}></div>
        <div style={styles.gradientOrb2}></div>
        <div style={styles.gradientOrb3}></div>
      </div>

      {/* Header Section */}
      <div style={{
        ...styles.header,
        opacity: scrollProgress,
        transform: `translateY(${(1 - scrollProgress) * 50}px)`
      }}>
        <div style={styles.ornament}>⟡</div>
        <h2 style={styles.mainTitle}>Curated Collection</h2>
        <p style={styles.subtitle}>Where artistry meets elegance</p>
        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerDiamond}>◆</span>
          <span style={styles.dividerLine}></span>
        </div>
      </div>

      {/* Category Filter */}
      <div style={styles.categoryWrapper}>
        <div style={styles.categoryContainer}>
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === cat.id ? styles.categoryBtnActive : {}),
                animationDelay: `${idx * 0.1}s`
              }}
            >
              <span style={styles.categoryIcon}>{cat.icon}</span>
              <span style={styles.categoryLabel}>{cat.label}</span>
              {selectedCategory === cat.id && (
                <div style={styles.categoryUnderline}></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div style={styles.productsGrid}>
        {filteredProducts.map((product, index) => {
          const isHovered = hoveredId === product._id;
          const delay = (index % 4) * 0.1;

          return (
            <div
              key={product._id}
              className="floating-frame"
              style={{
                ...styles.productCard,
                animationDelay: `${delay}s`
              }}
              onMouseEnter={() => setHoveredId(product._id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleProductClick(product._id)}
            >
              {/* Floating Frame */}
              <div style={{
                ...styles.floatingFrame,
                boxShadow: isHovered
                  ? '0 20px 60px rgba(48, 7, 8, 0.25), 0 0 0 1px rgba(48, 7, 8, 0.1)'
                  : '0 4px 20px rgba(0,0,0,0.08)',
              }}>
                {/* Hover Border Glow */}
                <div style={{
                  ...styles.glowBorder,
                  opacity: isHovered ? 1 : 0,
                }}></div>

                {/* Image Container */}
                <div style={styles.imageContainer}>
                  <img
                    src={getImage(product)}
                    loading='lazy'
                    alt={product.itemname}
                    style={{
                      ...styles.productImage,
                      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                      filter: isHovered ? 'brightness(1.05)' : 'brightness(1)',
                    }}
                  />

                  {/* Gradient Veil */}
                  <div style={styles.gradientVeil}></div>

                  {/* Floating Badge */}
                  <div
                    className="floating-badge"
                    style={{
                      ...styles.floatingBadge,
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
                    }}>
                    <div style={styles.badgeInner}>View</div>
                  </div>
                </div>

                {/* Product Info - Enhanced */}
                <div style={styles.productInfo}>
                  <h3 style={{
                    ...styles.productName,
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  }}>{product.itemname}</h3>

                  <div style={styles.priceRow}>
                    <div style={styles.priceContainer}>
                      <span style={styles.priceLabel}>From</span>
                      <span style={{
                        ...styles.price,
                        color: isHovered ? '#8B4513' : '#300708',
                      }}>{formatPrice(product)}</span>
                    </div>

                    {/* Hover Arrow Indicator */}
                    <div
                      className="arrow-indicator"
                      style={{
                        ...styles.arrowIndicator,
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                      }}>
                      <span style={styles.arrowIcon}>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative Footer */}
      <div style={styles.footer}>
        <div style={styles.footerOrnament}>❖</div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmerSlide {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }

        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate(100px, -50px) scale(1.2); opacity: 0.25; }
        }

        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(-80px, 60px) scale(1.3); opacity: 0.3; }
        }

        @keyframes orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate(60px, 80px) scale(1.1); opacity: 0.25; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes expandWidth {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: 0 8px 32px rgba(48, 7, 8, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
          }
          50% { 
            box-shadow: 0 8px 40px rgba(48, 7, 8, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          }
        }

        .floating-badge {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        @media (hover: hover) {
          .arrow-indicator:hover {
            transform: scale(1.1);
          }
          .category-btn:hover {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    padding: '80px 20px',
    backgroundColor: '#faf8f5',
    overflow: 'hidden',
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  gradientOrb1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(139, 69, 19, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'orb1 20s ease-in-out infinite',
    filter: 'blur(80px)',
  },
  gradientOrb2: {
    position: 'absolute',
    top: '50%',
    right: '10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(48, 7, 8, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'orb2 25s ease-in-out infinite',
    filter: 'blur(100px)',
  },
  gradientOrb3: {
    position: 'absolute',
    bottom: '10%',
    left: '50%',
    width: '700px',
    height: '700px',
    background: 'radial-gradient(circle, rgba(184, 134, 11, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'orb3 30s ease-in-out infinite',
    filter: 'blur(90px)',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#faf8f5',
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '3px solid rgba(48, 7, 8, 0.1)',
    borderTop: '3px solid #300708',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  ornament: {
    fontSize: '32px',
    color: '#8B4513',
    marginBottom: '20px',
    animation: 'float 3s ease-in-out infinite',
  },
  mainTitle: {
    fontFamily: "'Dancing Script', cursive",
    fontSize: 'clamp(42px, 6vw, 72px)',
    fontWeight: 700,
    color: '#300708',
    margin: '0 0 15px 0',
    letterSpacing: '1px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.05)',
  },
  subtitle: {
    fontSize: 'clamp(16px, 2vw, 20px)',
    color: '#6b5347',
    fontWeight: 300,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '30px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    margin: '30px auto',
    maxWidth: '300px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #8B4513, transparent)',
  },
  dividerDiamond: {
    fontSize: '12px',
    color: '#8B4513',
    animation: 'pulse 2s ease-in-out infinite',
  },
  categoryWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '60px',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  categoryContainer: {
    display: 'flex',
    gap: '12px',
    padding: '0 20px',
    minWidth: 'min-content',
  },
  categoryBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#fff',
    border: '1px solid rgba(48, 7, 8, 0.15)',
    borderRadius: '30px',
    color: '#300708',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    animation: 'slideIn 0.6s ease forwards',
    opacity: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  categoryBtnActive: {
    background: 'linear-gradient(135deg, #300708 0%, #4a1011 100%)',
    color: '#fff',
    borderColor: '#300708',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(48, 7, 8, 0.25)',
  },
  categoryIcon: {
    fontSize: '16px',
  },
  categoryLabel: {
    letterSpacing: '0.5px',
  },
  categoryUnderline: {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: '2px',
    background: '#fff',
    animation: 'expandWidth 0.4s ease',
  },
    productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 16px',
  },

  productCard: {
    animation: 'fadeInUp 0.8s ease forwards',
    opacity: 0,
  },
  floatingFrame: {
    position: 'relative',
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    height: '100%',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.4), rgba(48, 7, 8, 0.4))',
    padding: '2px',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
    transition: 'opacity 0.5s ease',
    zIndex: 5,
  },
  corner: {
    position: 'absolute',
    fontSize: '20px',
    color: '#8B4513',
    zIndex: 10,
    opacity: 0.4,
    transition: 'all 0.3s ease',
  },
  cornerTL: { top: '12px', left: '12px' },
  cornerTR: { top: '12px', right: '12px' },
  cornerBL: { bottom: '12px', left: '12px' },
  cornerBR: { bottom: '12px', right: '12px' },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '125%',
    overflow: 'hidden',
    backgroundColor: '#f8f6f3',
  },
  productImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  floatingBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(48, 7, 8, 0.92)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none',
    zIndex: 5,
    boxShadow: '0 8px 32px rgba(48, 7, 8, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
  },
  badgeInner: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  gradientVeil: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
    pointerEvents: 'none',
  },
  productInfo: {
    padding: '24px 20px',
    transition: 'all 0.4s ease',
    position: 'relative',
    zIndex: 2,
    background: '#fff',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productName: {
    fontFamily: "'Dancing Script', cursive",
    fontSize: '24px',
    fontWeight: 600,
    color: '#300708',
    marginBottom: '12px',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  priceLabel: {
    fontSize: '12px',
    color: '#8B4513',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  price: {
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    transition: 'color 0.3s ease',
  },
  arrowIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #300708, #4a1011)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(48, 7, 8, 0.3)',
  },
  arrowIcon: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
  },
  hoverInfoBar: {
    display: 'none',
  },
  hoverDetails: {
    display: 'none',
  },
  viewDetailsText: {
    display: 'none',
  },
  arrowCircle: {
    display: 'none',
  },
  footer: {
    textAlign: 'center',
    marginTop: '80px',
    paddingTop: '40px',
    borderTop: '1px solid rgba(48, 7, 8, 0.1)',
  },
  footerOrnament: {
    fontSize: '24px',
    color: '#8B4513',
    opacity: 0.5,
    animation: 'pulse 3s ease-in-out infinite',
  },
  '@media(max-width: 576px)': {
    productsGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    productCard: {
      maxWidth: '220px',
    },
    floatingFrame: {
      borderRadius: '10px',
    },
    corner: {
      fontSize: '16px',
    },
    cornerTL: { top: '8px', left: '8px' },
    cornerTR: { top: '8px', right: '8px' },
    cornerBL: { bottom: '8px', left: '8px' },
    cornerBR: { bottom: '8px', right: '8px' },
    imageContainer: {
      paddingTop: '100%',
    },
    productImage: {
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    floatingBadge: {
      width: '60px',
      height: '60px',
    },
    badgeInner: {
      fontSize: '12px',
    },
    shimmer: {
      animation: 'shimmerSlide 2s ease-in-out',
    },
    gradientVeil: {
      height: '40%',
    },
    productInfo: {
      padding: '16px 12px',
    },
    productName: {
      fontSize: '18px',
    },
    priceContainer: {
      gap: '6px',
    },
    priceLabel: {
      fontSize: '10px',
    },
    price: {
      fontSize: '16px',
    },
    arrowIndicator: {
      width: '28px',
      height: '28px',
    },
    arrowIcon: {
      fontSize: '14px',
    },
    footer: {
      marginTop: '60px',
      paddingTop: '30px',
    },
    footerOrnament: {
      fontSize: '18px',
    },
  },
};

export default JewelryShowcase;