import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getById(id);
      setProduct(data.product);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToWishlist(product._id);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error">Product not found</div>
          <button onClick={() => navigate('/products')} className="back-btn">
            <FiArrowLeft /> Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">

        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft /> Back
        </button>

        {/* Product Detail Grid */}
        <div className="product-detail-grid">

          {/* Left: Image */}
          <div className="product-image-section">
            <img src={product.itemImage} alt={product.itemname} />
          </div>

          {/* Right: Details */}
          <div className="product-info-section">

            <div className="product-category">{product.category}</div>

            <h1 className="product-title">{product.itemname}</h1>

            <p className="product-code">Product Code: {product.itemCode}</p>
            <div className="product-price-section">
              <div className="original-price-large">₹{product.basePrice?.toFixed(2)}</div>
              <div className="final-price-large">₹{product.finalPrice?.toFixed(2)}</div>
              <span className="discount-badge-large">10% OFF</span>
            </div>
            {/* Description */}
            {product.description && (
              <div className="product-description">
                <h3 className='font-color'>Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Stock Status */}
            <div className="stock-status">
              {product.inStock ? (
                <span className="in-stock">In Stock</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.inStock && (
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button onClick={decrementQuantity}>-</button>
                  <span className="quantity">{quantity}</span>
                  <button onClick={incrementQuantity}>+</button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              <button
                className="btn-add-cart"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <FiShoppingBag /> Add to Your Bag
              </button>

              <button
                className="btn-wishlist"
                onClick={handleAddToWishlist}
              >
                <FiHeart className={isInWishlist(product._id) ? 'active' : ''} />
                {isInWishlist(product._id) ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;