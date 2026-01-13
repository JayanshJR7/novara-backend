import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';
import { FiStar, FiChevronLeft, FiChevronRight, FiUser, FiCalendar, FiEdit3, FiX } from 'react-icons/fi';

const ReviewsSection = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rating: 5,
        title: '',
        review: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await reviewsAPI.getAll();
            setReviews(response.reviews || []);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.title || !formData.review) {
            alert('Please fill all required fields');
            return;
        }
        
        setSubmitting(true);

        try {
            await reviewsAPI.create(formData);
            setFormData({
                name: '',
                email: '',
                rating: 5,
                title: '',
                review: ''
            });
            setSubmitting(false);
            setShowReviewForm(false);
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(error.response?.data?.message || 'Failed to submit review');
            setSubmitting(false);
        }
    };

    const nextReview = () => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    };

    const renderStars = (rating, interactive = false, size = 24) => {
        return [...Array(5)].map((_, i) => (
            <FiStar
                key={i}
                size={size}
                style={{
                    fill: i < rating ? '#d4af37' : 'none',
                    stroke: i < rating ? '#d4af37' : 'rgba(212, 175, 55, 0.3)',
                    cursor: interactive ? 'pointer' : 'default',
                    transition: 'all 0.3s ease'
                }}
                onClick={() => interactive && handleRatingClick(i + 1)}
                onMouseEnter={(e) => interactive && (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => interactive && (e.currentTarget.style.transform = 'scale(1)')}
            />
        ));
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div style={styles.loadingRing}></div>
                <p style={styles.loadingText}>Loading testimonials...</p>
            </div>
        );
    }

    return (
        <div style={styles.reviewsSection}>
            {/* Animated Background */}
            <div style={styles.bgPattern}>
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            ...styles.bgStar,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`
                        }}
                    >
                        ✦
                    </div>
                ))}
            </div>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerAccent}>
                    <div style={styles.accentLine} />
                    <FiStar style={styles.headerIcon} />
                    <div style={styles.accentLine} />
                </div>
                <h2 style={styles.title}>Customer Testimonials</h2>
                <p style={styles.subtitle}>Hear from our delighted patrons</p>
            </div>

            {/* Success Message */}
            {submitSuccess && (
                <div style={styles.successBanner}>
                    ✓ Thank you! Your review has been submitted and is awaiting approval.
                </div>
            )}

            {/* Reviews Carousel */}
            {reviews.length > 0 ? (
                <>
                    <div style={styles.carouselWrapper}>
                        <button
                            onClick={prevReview}
                            style={styles.navBtn}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <FiChevronLeft size={28} />
                        </button>

                        <div style={styles.reviewsTrack}>
                            {reviews.map((review, index) => {
                                const offset = index - currentIndex;
                                const isActive = index === currentIndex;

                                return (
                                    <div
                                        key={review._id}
                                        style={{
                                            ...styles.reviewCard,
                                            transform: `translateX(${offset * 110}%) scale(${isActive ? 1 : 0.9})`,
                                            opacity: Math.abs(offset) > 1 ? 0 : (isActive ? 1 : 0.3),
                                            zIndex: isActive ? 10 : 1,
                                            pointerEvents: isActive ? 'all' : 'none'
                                        }}
                                    >
                                        <div style={styles.cardInner}>
                                            {/* Top Decoration */}
                                            <div style={styles.topDecor}>
                                                <div style={styles.decorLine} />
                                                <div style={styles.decorDiamond}>◆</div>
                                                <div style={styles.decorLine} />
                                            </div>

                                            {/* Stars */}
                                            <div style={styles.starsContainer}>
                                                {renderStars(review.rating)}
                                            </div>

                                            {/* Review Title */}
                                            <h3 style={styles.reviewTitle}>{review.title}</h3>

                                            {/* Review Text */}
                                            <p style={styles.reviewText}>{review.review}</p>

                                            {/* Customer Info */}
                                            <div style={styles.customerInfo}>
                                                <div style={styles.avatar}>
                                                    <FiUser size={24} />
                                                </div>
                                                <div style={styles.customerDetails}>
                                                    <div style={styles.customerName}>
                                                        {review.name}
                                                        {review.verified && (
                                                            <span style={styles.verifiedBadge}>✓ Verified</span>
                                                        )}
                                                    </div>
                                                    <div style={styles.reviewDate}>
                                                        <FiCalendar size={12} />
                                                        <span>{formatDate(review.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quote Mark */}
                                            <div style={styles.quoteMark}>"</div>

                                            {/* Corner Decorations */}
                                            <div style={{...styles.cornerAccent, ...styles.cornerTL}} />
                                            <div style={{...styles.cornerAccent, ...styles.cornerTR}} />
                                            <div style={{...styles.cornerAccent, ...styles.cornerBL}} />
                                            <div style={{...styles.cornerAccent, ...styles.cornerBR}} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={nextReview}
                            style={styles.navBtn}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <FiChevronRight size={28} />
                        </button>
                    </div>

                    {/* Dots Indicator */}
                    <div style={styles.dotsContainer}>
                        {reviews.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                style={{
                                    ...styles.dot,
                                    background: index === currentIndex ? '#d4af37' : 'rgba(212, 175, 55, 0.2)',
                                    width: index === currentIndex ? '35px' : '10px'
                                }}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div style={styles.emptyState}>
                    <FiStar size={64} style={{ color: '#ddd', marginBottom: '20px' }} />
                    <p style={styles.emptyText}>Be the first to share your experience!</p>
                </div>
            )}

            {/* Write Review Button */}
            <div style={styles.ctaContainer}>
                <button
                    onClick={() => setShowReviewForm(true)}
                    style={styles.writeReviewBtn}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(212, 175, 55, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.3)';
                    }}
                >
                    <FiEdit3 size={20} />
                    <span>Share Your Experience</span>
                </button>
            </div>

            {/* Review Form Modal */}
            {showReviewForm && (
                <div style={styles.modalOverlay} onClick={() => setShowReviewForm(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowReviewForm(false)}
                            style={styles.closeBtn}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
                        >
                            <FiX size={24} />
                        </button>

                        <div style={styles.formHeader}>
                            <h3 style={styles.formTitle}>Share Your Experience</h3>
                            <p style={styles.formSubtitle}>We value your feedback</p>
                        </div>

                        <div style={styles.formContainer}>
                            {/* Rating */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Your Rating</label>
                                <div style={styles.ratingInput}>
                                    {renderStars(formData.rating, true, 32)}
                                </div>
                            </div>

                            {/* Name */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                    placeholder="Your full name"
                                />
                            </div>

                            {/* Email */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            {/* Review Title */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Review Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                    placeholder="Sum up your experience"
                                />
                            </div>

                            {/* Review Text */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Your Review *</label>
                                <textarea
                                    name="review"
                                    value={formData.review}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.textarea}
                                    placeholder="Share your detailed experience with us..."
                                    rows={5}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    ...styles.submitBtn,
                                    opacity: submitting ? 0.7 : 1,
                                    cursor: submitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{keyframes}</style>
        </div>
    );
};

const keyframes = `
    @keyframes twinkle {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.3); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const styles = {
    reviewsSection: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #faf8f6 0%, #ffffff 50%, #f5f1ed 100%)',
        padding: '100px 20px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Poppins', sans-serif"
    },
    bgPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        opacity: 0.1
    },
    bgStar: {
        position: 'absolute',
        color: '#300708',
        fontSize: '20px',
        animation: 'twinkle 3s infinite ease-in-out'
    },
    header: {
        textAlign: 'center',
        marginBottom: '80px',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeIn 1s ease'
    },
    headerAccent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '25px'
    },
    accentLine: {
        width: '80px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
    },
    headerIcon: {
        color: '#d4af37',
        fontSize: '28px',
        filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))'
    },
    title: {
        fontSize: '56px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #300708 0%, #5a0d10 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '15px',
        letterSpacing: '1px',
        fontFamily: "'Playfair Display', serif"
    },
    subtitle: {
        fontSize: '18px',
        color: '#666',
        fontWeight: '300',
        letterSpacing: '2px'
    },
    successBanner: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '40px',
        maxWidth: '600px',
        margin: '0 auto 40px',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
        fontSize: '15px',
        fontWeight: '500'
    },
    carouselWrapper: {
        position: 'relative',
        maxWidth: '900px',
        margin: '0 auto',
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    navBtn: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: '2px solid #d4af37',
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#300708',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        zIndex: 20,
        boxShadow: '0 4px 15px rgba(48, 7, 8, 0.1)'
    },
    reviewsTrack: {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 20px'
    },
    reviewCard: {
        position: 'absolute',
        width: '700px',
        maxWidth: '90vw',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    cardInner: {
        background: '#ffffff',
        borderRadius: '24px',
        padding: '60px 50px',
        boxShadow: '0 20px 60px rgba(48, 7, 8, 0.12)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        position: 'relative',
        overflow: 'hidden'
    },
    topDecor: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '30px'
    },
    decorLine: {
        flex: 1,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
    },
    decorDiamond: {
        color: '#d4af37',
        fontSize: '12px'
    },
    starsContainer: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '25px'
    },
    reviewTitle: {
        fontSize: '26px',
        fontWeight: '600',
        color: '#300708',
        textAlign: 'center',
        marginBottom: '20px',
        fontFamily: "'Playfair Display', serif"
    },
    reviewText: {
        fontSize: '16px',
        lineHeight: '1.8',
        color: '#555',
        textAlign: 'center',
        marginBottom: '35px',
        fontStyle: 'italic',
        minHeight: '100px'
    },
    customerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        justifyContent: 'center'
    },
    avatar: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #300708 0%, #5a0d10 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4af37',
        border: '3px solid #d4af37',
        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
    },
    customerDetails: {
        textAlign: 'left'
    },
    customerName: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#300708',
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    verifiedBadge: {
        fontSize: '12px',
        color: '#10b981',
        fontWeight: '500',
        background: 'rgba(16, 185, 129, 0.1)',
        padding: '3px 8px',
        borderRadius: '12px'
    },
    reviewDate: {
        fontSize: '13px',
        color: '#999',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    quoteMark: {
        position: 'absolute',
        top: '20px',
        right: '30px',
        fontSize: '120px',
        color: 'rgba(212, 175, 55, 0.1)',
        fontFamily: 'Georgia, serif',
        lineHeight: '1',
        pointerEvents: 'none'
    },
    cornerAccent: {
        position: 'absolute',
        width: '25px',
        height: '25px',
        border: '2px solid #d4af37',
        opacity: 0.4
    },
    cornerTL: { top: '15px', left: '15px', borderRight: 'none', borderBottom: 'none' },
    cornerTR: { top: '15px', right: '15px', borderLeft: 'none', borderBottom: 'none' },
    cornerBL: { bottom: '15px', left: '15px', borderRight: 'none', borderTop: 'none' },
    cornerBR: { bottom: '15px', right: '15px', borderLeft: 'none', borderTop: 'none' },
    dotsContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '50px'
    },
    dot: {
        height: '10px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.4s ease',
        boxShadow: '0 2px 8px rgba(212, 175, 55, 0.2)'
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        color: '#999'
    },
    emptyText: {
        fontSize: '18px',
        color: '#666'
    },
    ctaContainer: {
        textAlign: 'center',
        marginTop: '60px'
    },
    writeReviewBtn: {
        padding: '18px 45px',
        background: 'linear-gradient(135deg, #300708 0%, #5a0d10 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '50px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.4s ease',
        boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)',
        letterSpacing: '0.5px'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(5px)'
    },
    modalContent: {
        background: '#ffffff',
        borderRadius: '24px',
        padding: '50px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
        animation: 'fadeIn 0.4s ease'
    },
    closeBtn: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #ddd',
        background: '#fff',
        color: '#666',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
    },
    formHeader: {
        textAlign: 'center',
        marginBottom: '40px'
    },
    formTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#300708',
        marginBottom: '10px',
        fontFamily: "'Playfair Display', serif"
    },
    formSubtitle: {
        fontSize: '15px',
        color: '#666'
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#300708',
        letterSpacing: '0.5px'
    },
    ratingInput: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        padding: '15px'
    },
    input: {
        padding: '14px 18px',
        border: '2px solid #e5e5e5',
        borderRadius: '12px',
        fontSize: '15px',
        fontFamily: "'Poppins', sans-serif",
        transition: 'all 0.3s ease',
        outline: 'none'
    },
    textarea: {
        padding: '14px 18px',
        border: '2px solid #e5e5e5',
        borderRadius: '12px',
        fontSize: '15px',
        fontFamily: "'Poppins', sans-serif",
        transition: 'all 0.3s ease',
        outline: 'none',
        resize: 'vertical'
    },
    submitBtn: {
        padding: '16px',
        background: 'linear-gradient(135deg, #300708 0%, #5a0d10 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '10px',
        boxShadow: '0 4px 15px rgba(48, 7, 8, 0.3)',
        letterSpacing: '0.5px'
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #faf8f6 0%, #ffffff 50%, #f5f1ed 100%)'
    },
    loadingRing: {
        width: '60px',
        height: '60px',
        border: '4px solid rgba(212, 175, 55, 0.2)',
        borderTop: '4px solid #d4af37',
        borderRadius: '50%',
        animation: 'rotate 1s linear infinite',
        marginBottom: '20px'
    },
    loadingText: {
        fontSize: '16px',
        color: '#666',
        letterSpacing: '1px'
    }
};

export default ReviewsSection;