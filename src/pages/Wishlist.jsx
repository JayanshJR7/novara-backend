import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { FiShoppingBag, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import './Wishlist.css';
import Navbar from '../components/Navbar';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { wishlist, loading, removeFromWishlist, addToCart } = useCart();
  const [addingToCartId, setAddingToCartId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      alert('Failed to remove item');
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product || !product._id) return;

    try {
      setAddingToCartId(product._id);
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCartId(null);
    }
  };

  // Render Navbar outside the conditional content
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="wishlist-page">
          <div className="container">
            <div className="loading">Loading wishlist...</div>
          </div>
        </div>
      </>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <>
        <Navbar />
        <div className="wishlist-page">
          <div className="container">
            <div className="empty-wishlist">
              <h2>Your Wishlist is Empty</h2>
              <p>Save your favorite items here!</p>
              <button onClick={() => navigate('/products')}>
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="wishlist-page">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FiArrowLeft /> Back
          </button>

          <div className="wishlist-header">
            <div>
              <h1>My Wishlist</h1>
              <p>{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="products-grid">
            {wishlist.map((product) => {
              if (!product || !product._id) return null;

              return (
                <div className="wishlist-item" key={product._id}>
                  <ProductCard product={product} />

                  <div className="btn-container">
                    <button
                      className="cartadd-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingToCartId === product._id}
                    >
                      <FiShoppingBag size={18} />
                      {addingToCartId === product._id ? 'Adding...' : 'Add to Cart'}
                    </button>

                    <button
                      className="remove-wishlist-btn"
                      onClick={() => handleRemove(product._id)}
                    >
                      <FiTrash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;