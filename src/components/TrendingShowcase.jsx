import React, { useState, useEffect } from 'react';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api';
import './TrendingShowcase.css';

const TrendingShowcase = () => {
    const [hoveredId, setHoveredId] = useState(null);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, addToWishlist, isInWishlist } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate(); 

    useEffect(() => {
        fetchTrendingProducts();
    }, []);

    const fetchTrendingProducts = async () => {
        try {
            setLoading(true);
            const data = await productsAPI.getTrending();
            // Get 8-12 products for the showcase
            setTrendingProducts(data.products.slice(0, 30));
        } catch (error) {
            console.error('Failed to fetch trending products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Please login to add items to cart');
            navigate('/login');
            return;
        }

        try {
            await addToCart(product._id, 1);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to add to cart. Please try again.');
        }
    };

    const handleAddToWishlist = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Please login to add items to wishlist');
            navigate('/login');
            return;
        }

        try {
            await addToWishlist(product._id);
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            alert('Failed to add to wishlist. Please try again.');
        }
    };

    const handleCardClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            return product.images[0];
        }
        return 'https://via.placeholder.com/400x400?text=No+Image';
    };

    const formatPrice = (product) => {
        const price = product.calculatedPrice || product.basePrice || 0;
        return `₹${price.toLocaleString('en-IN')}`;
    };

    if (loading) {
        return (
            <section className="trending-now-section">
                <div className="trending-container">
                    <div className="trending-header">
                        <h2>Trending Now</h2>
                        <p>Loading amazing pieces...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!trendingProducts.length) {
        return null;
    }

    const duplicatedProducts = [...trendingProducts, ...trendingProducts];

    return (
        <section className="trending-now-section">
            <div className="trending-container">
                <div className="trending-header">
                    <h2>Trending Now</h2>
                    <p>Discover our most loved pieces</p>
                </div>

                <div className="showcase-wrapper">
                    <div className="showcase-track">
                        {duplicatedProducts.map((product, index) => {
                            const uniqueKey = `${product._id}-${index}`;
                            const inWishlist = isInWishlist(product._id);

                            return (
                                <div
                                    key={uniqueKey}
                                    className="showcase-card"
                                    onMouseEnter={() => setHoveredId(uniqueKey)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => handleCardClick(product._id)}
                                >
                                    <div className="card-image-container">
                                        <img
                                            src={product.itemImage}
                                            alt={product.itemname}
                                            loading='lazy'
                                            className="card-image"
                                        />
                                        <div className={`card-overlay ${hoveredId === uniqueKey ? 'visible' : ''}`}>
                                            <button
                                                className={`icon-btn ${inWishlist ? 'active' : ''}`}
                                                onClick={(e) => handleAddToWishlist(e, product)}
                                                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                            >
                                                <FiHeart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                                            </button>
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => handleAddToCart(e, product)}
                                                title="Add to cart"
                                            >
                                                <FiShoppingBag size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-info">
                                        <h3>{product.itemname}</h3>
                                        <p className="price">{formatPrice(product)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="gradient-overlay gradient-left"></div>
                <div className="gradient-overlay gradient-right"></div>
            </div>
        </section>
    );
};

export default TrendingShowcase;