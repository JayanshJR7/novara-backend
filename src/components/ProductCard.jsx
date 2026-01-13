import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const ProductCard = ({ product }) => {
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      setAddingToWishlist(true);
      await addToWishlist(product._id);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      alert('Failed to add to wishlist. Please try again.');
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (!product || !product._id) {
    return null;
  }
  const price = product.finalPrice || 0;
  const inWishlist = isInWishlist(product._id);

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product._id}`} className="product-link">
        {/* Product Image */}
        <div className="product-image">
          <img
            src={product.itemImage}
            alt={product.itemname}
            loading='lazy'
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400?text=No+Image';
            }}
          />

          <div className={`card-overlay ${isHovered ? 'visible' : ''}`}>
            <button
              className={`icon-btn ${inWishlist ? 'active' : ''}`}
              onClick={handleAddToWishlist}
              disabled={addingToWishlist}
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              className="icon-btn"
              onClick={handleAddToCart}
              disabled={addingToCart}
              title="Add to cart"
            >
              <FiShoppingBag size={20} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h3 className="product-name">{product.itemname}</h3>
          <div className="dabba">
            <p className="product-code">{product.itemCode}</p>
            {!product.inStock && (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>
          <div className="product-pricing">
            <p className="original-price">₹{product.basePrice?.toLocaleString('en-IN')}</p>
            <p className="product-price" style={{ color: "#3c0a0bff" }}>
              ₹{price.toLocaleString('en-IN')}
            </p>
            <span className="discount-badge">10% OFF</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;