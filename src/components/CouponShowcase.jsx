import React, { useState, useEffect, useRef } from 'react';
import { couponsAPI } from '../services/api';
import { FiCopy, FiCheck, FiPercent, FiTag, FiClock, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';

const CouponShowcase = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState({});
    const carouselRef = useRef(null);

    useEffect(() => {
        fetchActiveCoupons();
    }, []);

    const fetchActiveCoupons = async () => {
        try {
            const response = await couponsAPI.getActive();
            setCoupons(response.coupons || []);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleFlip = (id) => {
        setIsFlipped(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const nextCoupon = () => {
        setActiveIndex((prev) => (prev + 1) % coupons.length);
    };

    const prevCoupon = () => {
        setActiveIndex((prev) => (prev - 1 + coupons.length) % coupons.length);
    };

    const getDaysLeft = (expiryDate) => {
        return Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div style={styles.loadingRing}></div>
                <p style={styles.loadingText}>Unveiling Exclusive Offers...</p>
            </div>
        );
    }

    if (coupons.length === 0) return null;

    return (
        <div style={styles.showcase}>
            {/* Animated Background */}
            <div style={styles.bgAnimation}>
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            ...styles.particle,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${15 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerOrnament}>
                    <FiStar style={styles.starIcon} />
                    <FiStar style={styles.starIcon} />
                    <FiStar style={styles.starIcon} />
                </div>
                <h1 style={styles.title}>Curated Exclusives</h1>
                <p style={styles.subtitle}>Premium discounts reserved for discerning collectors</p>
            </div>

            {/* Premium Carousel Display */}
            <div style={styles.carouselContainer} ref={carouselRef}>
                <button 
                    onClick={prevCoupon} 
                    style={{...styles.navButton, ...styles.navButtonLeft}}
                    onMouseEnter={(e) => e.currentTarget.style.background = styles.navButtonHover.background}
                    onMouseLeave={(e) => e.currentTarget.style.background = styles.navButton.background}
                >
                    <FiChevronLeft size={32} />
                </button>

                <div style={styles.carouselTrack}>
                    {coupons.map((coupon, index) => {
                        const offset = index - activeIndex;
                        const isActive = index === activeIndex;
                        
                        return (
                            <div
                                key={coupon._id}
                                style={{
                                    ...styles.couponWrapper,
                                    transform: `translateX(${offset * 420}px) scale(${isActive ? 1 : 0.85})`,
                                    opacity: Math.abs(offset) > 1 ? 0 : (isActive ? 1 : 0.5),
                                    zIndex: isActive ? 10 : 5 - Math.abs(offset),
                                    pointerEvents: isActive ? 'all' : 'none'
                                }}
                            >
                                <div 
                                    style={{
                                        ...styles.couponCard,
                                        transform: isFlipped[coupon._id] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                    }}
                                    onClick={() => isActive && handleFlip(coupon._id)}
                                >
                                    {/* Front Side */}
                                    <div style={styles.cardFront}>
                                        <div style={styles.luxuryPattern}>
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} style={styles.patternLine} />
                                            ))}
                                        </div>
                                        
                                        <div style={styles.cardContent}>
                                            <div style={styles.discountCircle}>
                                                <div style={styles.discountInner}>
                                                    <div style={styles.discountIcon}>
                                                        {coupon.discountType === 'percentage' ? <FiPercent size={36} /> : <FiTag size={36} />}
                                                    </div>
                                                    <div style={styles.discountAmount}>
                                                        {coupon.discountType === 'percentage' 
                                                            ? `${coupon.discountValue}%` 
                                                            : `₹${coupon.discountValue}`
                                                        }
                                                    </div>
                                                    <div style={styles.discountLabel}>DISCOUNT</div>
                                                </div>
                                            </div>

                                            <h3 style={styles.couponTitle}>{coupon.description}</h3>

                                            <div style={styles.codeDisplay}>
                                                <div style={styles.codeWrapper}>
                                                    <span style={styles.codeText}>{coupon.code}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopy(coupon.code);
                                                }}
                                                style={{
                                                    ...styles.copyButton,
                                                    background: copiedCode === coupon.code ? '#10b981' : styles.copyButton.background
                                                }}
                                                onMouseEnter={(e) => !copiedCode && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                                            >
                                                {copiedCode === coupon.code ? (
                                                    <>
                                                        <FiCheck size={18} />
                                                        <span>Copied to Clipboard</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiCopy size={18} />
                                                        <span>Copy Coupon Code</span>
                                                    </>
                                                )}
                                            </button>

                                            <div style={styles.tapHint}>
                                                <span style={styles.hintText}>Tap card for details</span>
                                            </div>
                                        </div>

                                        <div style={styles.cornerDecor}>
                                            <div style={{...styles.corner, ...styles.cornerTL}} />
                                            <div style={{...styles.corner, ...styles.cornerTR}} />
                                            <div style={{...styles.corner, ...styles.cornerBL}} />
                                            <div style={{...styles.corner, ...styles.cornerBR}} />
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div style={styles.cardBack}>
                                        <div style={styles.backContent}>
                                            <h4 style={styles.backTitle}>Offer Details</h4>
                                            
                                            <div style={styles.detailsList}>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Minimum Order</span>
                                                    <span style={styles.detailValue}>
                                                        {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount.toLocaleString()}` : 'No minimum'}
                                                    </span>
                                                </div>
                                                
                                                {coupon.maxDiscount && (
                                                    <div style={styles.detailItem}>
                                                        <span style={styles.detailLabel}>Maximum Discount</span>
                                                        <span style={styles.detailValue}>₹{coupon.maxDiscount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Valid Until</span>
                                                    <span style={styles.detailValue}>
                                                        {new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                
                                                {coupon.usageLimit && (
                                                    <div style={styles.detailItem}>
                                                        <span style={styles.detailLabel}>Remaining Uses</span>
                                                        <span style={{...styles.detailValue, color: '#d4af37'}}>
                                                            {coupon.usageLimit - coupon.usedCount} of {coupon.usageLimit}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={styles.urgencyBadge}>
                                                <FiClock size={16} />
                                                <span>Only {getDaysLeft(coupon.expiresAt)} days remaining</span>
                                            </div>

                                            <div style={styles.backHint}>
                                                <span style={styles.hintText}>Tap to return</span>
                                            </div>
                                        </div>

                                        <div style={styles.cornerDecor}>
                                            <div style={{...styles.corner, ...styles.cornerTL}} />
                                            <div style={{...styles.corner, ...styles.cornerTR}} />
                                            <div style={{...styles.corner, ...styles.cornerBL}} />
                                            <div style={{...styles.corner, ...styles.cornerBR}} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button 
                    onClick={nextCoupon} 
                    style={{...styles.navButton, ...styles.navButtonRight}}
                    onMouseEnter={(e) => e.currentTarget.style.background = styles.navButtonHover.background}
                    onMouseLeave={(e) => e.currentTarget.style.background = styles.navButton.background}
                >
                    <FiChevronRight size={32} />
                </button>
            </div>

            {/* Dots Indicator */}
            <div style={styles.dotsContainer}>
                {coupons.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        style={{
                            ...styles.dot,
                            background: index === activeIndex ? '#300708' : 'rgba(48, 7, 8, 0.2)',
                            width: index === activeIndex ? '40px' : '12px'
                        }}
                    />
                ))}
            </div>

            {/* Footer CTA */}
            <div style={styles.footer}>
                <div style={styles.footerContent}>
                    <p style={styles.footerText}>
                        Apply these exclusive codes at checkout to unlock your savings
                    </p>
                </div>
            </div>

            <style>{keyframes}</style>
        </div>
    );
};

const keyframes = `
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
    }
    
    @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
    }
    
    @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3), 0 20px 60px rgba(48, 7, 8, 0.2); }
        50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.5), 0 25px 70px rgba(48, 7, 8, 0.3); }
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const styles = {
    showcase: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1e 50%, #1a1a1a 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 20px',
        fontFamily: "'Poppins', sans-serif"
    },
    bgAnimation: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        opacity: 0.15,
        pointerEvents: 'none'
    },
    particle: {
        position: 'absolute',
        width: '2px',
        height: '2px',
        background: '#d4af37',
        borderRadius: '50%',
        animation: 'float 20s infinite ease-in-out',
        boxShadow: '0 0 10px #d4af37'
    },
    header: {
        textAlign: 'center',
        marginBottom: '80px',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeInUp 1s ease'
    },
    headerOrnament: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        marginBottom: '20px'
    },
    starIcon: {
        color: '#d4af37',
        fontSize: '24px',
        animation: 'float 3s infinite ease-in-out',
        filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))'
    },
    title: {
        fontSize: '72px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '15px',
        letterSpacing: '2px',
        fontFamily: "'Playfair Display', serif",
        textShadow: '0 0 30px rgba(212, 175, 55, 0.3)'
    },
    subtitle: {
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '300',
        letterSpacing: '3px',
        textTransform: 'uppercase'
    },
    carouselContainer: {
        position: 'relative',
        maxWidth: '1400px',
        margin: '0 auto',
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    carouselTrack: {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    couponWrapper: {
        position: 'absolute',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        perspective: '2000px'
    },
    couponCard: {
        width: '400px',
        height: '550px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        animation: 'pulse-glow 3s infinite ease-in-out'
    },
    cardFront: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        background: 'linear-gradient(135deg, #2a1a1d 0%, #1f1416 100%)',
        borderRadius: '24px',
        border: '2px solid rgba(212, 175, 55, 0.3)',
        overflow: 'hidden'
    },
    cardBack: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        background: 'linear-gradient(135deg, #1f1416 0%, #2a1a1d 100%)',
        borderRadius: '24px',
        border: '2px solid rgba(212, 175, 55, 0.3)',
        overflow: 'hidden'
    },
    luxuryPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '120px',
        background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%)',
        display: 'flex',
        justifyContent: 'space-around',
        opacity: 0.3
    },
    patternLine: {
        width: '1px',
        height: '100%',
        background: 'linear-gradient(180deg, #d4af37 0%, transparent 100%)'
    },
    cardContent: {
        position: 'relative',
        padding: '50px 40px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    discountCircle: {
        width: '180px',
        height: '180px',
        background: 'linear-gradient(135deg, #d4af37 0%, #f4e4c1 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 40px rgba(212, 175, 55, 0.4), inset 0 -5px 20px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        animation: 'float 4s infinite ease-in-out'
    },
    discountInner: {
        width: '160px',
        height: '160px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1e 100%)',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid rgba(212, 175, 55, 0.5)'
    },
    discountIcon: {
        color: '#d4af37',
        marginBottom: '10px'
    },
    discountAmount: {
        fontSize: '42px',
        fontWeight: '800',
        color: '#d4af37',
        letterSpacing: '1px'
    },
    discountLabel: {
        fontSize: '11px',
        color: 'rgba(212, 175, 55, 0.8)',
        letterSpacing: '2px',
        marginTop: '5px',
        fontWeight: '600'
    },
    couponTitle: {
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        fontWeight: '400',
        lineHeight: '1.6',
        margin: '20px 0',
        minHeight: '50px'
    },
    codeDisplay: {
        width: '100%',
        marginBottom: '20px'
    },
    codeWrapper: {
        background: 'rgba(212, 175, 55, 0.1)',
        border: '2px dashed #d4af37',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
    },
    codeText: {
        fontSize: '32px',
        fontWeight: '800',
        letterSpacing: '6px',
        color: '#d4af37',
        textShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
    },
    copyButton: {
        width: '100%',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #d4af37 0%, #f4e4c1 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#1a1a1a',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        letterSpacing: '1px',
        transition: 'all 0.3s ease',
        boxShadow: '0 5px 20px rgba(212, 175, 55, 0.3)',
        textTransform: 'uppercase'
    },
    tapHint: {
        marginTop: '10px'
    },
    hintText: {
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: '1px',
        fontWeight: '300'
    },
    backContent: {
        padding: '50px 40px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    backTitle: {
        fontSize: '28px',
        color: '#d4af37',
        textAlign: 'center',
        marginBottom: '40px',
        fontWeight: '600',
        letterSpacing: '2px'
    },
    detailsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        marginBottom: '30px'
    },
    detailItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
    },
    detailLabel: {
        fontSize: '13px',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        fontWeight: '500'
    },
    detailValue: {
        fontSize: '16px',
        color: '#fff',
        fontWeight: '600'
    },
    urgencyBadge: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '15px',
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '10px',
        color: '#ef4444',
        fontSize: '13px',
        fontWeight: '600',
        marginTop: '20px'
    },
    backHint: {
        textAlign: 'center',
        marginTop: '30px'
    },
    cornerDecor: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none'
    },
    corner: {
        position: 'absolute',
        width: '30px',
        height: '30px',
        border: '2px solid #d4af37'
    },
    cornerTL: {
        top: '20px',
        left: '20px',
        borderRight: 'none',
        borderBottom: 'none'
    },
    cornerTR: {
        top: '20px',
        right: '20px',
        borderLeft: 'none',
        borderBottom: 'none'
    },
    cornerBL: {
        bottom: '20px',
        left: '20px',
        borderRight: 'none',
        borderTop: 'none'
    },
    cornerBR: {
        bottom: '20px',
        right: '20px',
        borderLeft: 'none',
        borderTop: 'none'
    },
    navButton: {
        position: 'absolute',
        zIndex: 20,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: '2px solid rgba(212, 175, 55, 0.5)',
        background: 'rgba(212, 175, 55, 0.1)',
        color: '#d4af37',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
    },
    navButtonHover: {
        background: 'rgba(212, 175, 55, 0.2)',
        transform: 'scale(1.1)'
    },
    navButtonLeft: {
        left: '50px'
    },
    navButtonRight: {
        right: '50px'
    },
    dotsContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '60px',
        position: 'relative',
        zIndex: 2
    },
    dot: {
        height: '12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 8px rgba(48, 7, 8, 0.3)'
    },
    footer: {
        marginTop: '80px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2
    },
    footerContent: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '30px 40px',
        background: 'rgba(212, 175, 55, 0.05)',
        border: '2px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
    },
    footerText: {
        fontSize: '16px',
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: '1.6',
        margin: 0,
        letterSpacing: '0.5px'
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1e 50%, #1a1a1a 100%)'
    },
    loadingRing: {
        width: '80px',
        height: '80px',
        border: '4px solid rgba(212, 175, 55, 0.2)',
        borderTop: '4px solid #d4af37',
        borderRadius: '50%',
        animation: 'rotate 1s linear infinite',
        boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
        marginBottom: '30px'
    },
    loadingText: {
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: '2px',
        fontWeight: '300'
    }
};

export default CouponShowcase;