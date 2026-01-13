import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import './Cart.css';
import Navbar from '../components/Navbar';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const {
    cart,
    cartTotal,
    updateCartItem,
    removeFromCart,
    clearCart,
    loading
  } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleUpdateQuantity = async (e, productId, newQuantity) => {
    e.preventDefault();
    e.stopPropagation();

    if (newQuantity < 1) return;

    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error('=== UPDATE FAILED ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('====================');
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleRemove = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        alert('Failed to clear cart');
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <div className="container">
            <div className="loading">Loading cart...</div>
          </div>
        </div>
      </>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <div className="container">
            <div className="empty-cart">
              <h2>Your Cart is Empty</h2>
              <p>Add some products to get started!</p>
              <button onClick={() => navigate('/products')}>
                Start Shopping
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
      <div className="cart-page">
        <div className="container">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            <button
              type="button"
              className="clear-cart"
              onClick={handleClearCart}
            >
              Clear Cart
            </button>
          </div>

          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items">
              {cart.map((item) => {
                // Handle null/undefined product
                if (!item.product) {
                  console.error('Cart item missing product:', item);
                  return null;
                }

                // The productId is stored as _id in the product object
                const productId = item.product._id || item.product.id;

                if (!productId) {
                  console.error('Could not find productId for item:', item);
                  return null;
                }


                return (
                  <div key={productId} className="cart-item">
                    <img
                      src={item.product.itemImage}
                      loading='lazy'
                      alt={item.product.itemname}
                      className="item-image"
                    />

                    <div className="item-details">
                      <h3>{item.product.itemname}</h3>
                      <p className="item-code">{item.product.itemCode}</p>
                      <p className="item-price">
                        ₹{item.product.finalPrice?.toFixed(2) || '0.00'}
                      </p>
                    </div>

                    <div className="item-quantity">
                      <button
                        type="button"
                        onClick={(e) => handleUpdateQuantity(e, productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span className='quantity'>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={(e) => handleUpdateQuantity(e, productId, item.quantity + 1)}
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <div className="item-total">
                      ₹{item.itemTotal?.toFixed(2) || '0.00'}
                    </div>

                    <button
                      type="button"
                      className="item-remove"
                      onClick={(e) => handleRemove(e, productId)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal?.toFixed(2) || '0.00'}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span>₹{cartTotal?.toFixed(2) || '0.00'}</span>
              </div>

              <button
                type="button"
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>

              <button
                type="button"
                className="continue-shopping"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;