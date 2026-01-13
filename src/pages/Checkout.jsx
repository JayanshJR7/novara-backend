import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI, couponsAPI } from '../services/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Country, State, City } from 'country-state-city';
import './Checkout.css';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    country: 'IN', // Default to India
    state: '',
    city: '',
    zipCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);

  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [paymentVerified, setPaymentVerified] = useState(false);

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const countryStates = State.getStatesOfCountry(formData.country);
      setStates(countryStates);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
      setCities([]);
    }
  }, [formData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const stateCities = City.getCitiesOfState(formData.country, formData.state);
      setCities(stateCities);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state]);

  const calculateDeliveryCharge = () => {
    // Free delivery for orders above ₹5000
    if (cartTotal >= 5000) {
      return 0;
    }
    // ₹300 for orders above ₹2000
    if (cartTotal >= 2000) {
      return 300;
    }
    // ₹500 for all other orders
    return 500;
  };

  // Format number with Indian comma style (₹1,00,000)
  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user, cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ Validate phone number
      if (!formData.phone || formData.phone.trim() === '') {
        setError('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      const deliveryCharge = calculateDeliveryCharge();

      // ✅ Get state and country names
      const stateName = states.find(s => s.isoCode === formData.state)?.name || formData.state;
      const countryName = countries.find(c => c.isoCode === formData.country)?.name || formData.country;

      const orderData = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        // ✅ Send shippingAddress as an object (matching Order model schema)
        shippingAddress: {
          address: formData.address,  // Street address only
          city: formData.city,
          state: stateName,
          country: countryName,
          zipCode: formData.zipCode
        },
        paymentMethod: 'razorpay',
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discount: discount,
        deliveryCharge: deliveryCharge,
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      };


      const orderResponse = await ordersAPI.createOrder(orderData);
      const order = orderResponse.order;

      const razorpayOrderData = await paymentAPI.createOrder(
        Number(getFinalTotal().toFixed(2)),
        order._id
      );

      setLoading(false);
      openRazorpayModal(razorpayOrderData, order);

    } catch (err) {
      console.error('❌ Checkout error:', err);
      console.error('❌ Server response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to initiate checkout.');
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      const response = await couponsAPI.validate(couponCode.toUpperCase(), cartTotal);

      if (response.valid) {
        setAppliedCoupon(response.coupon);
        setDiscount(response.coupon.discount);
        setCouponError('');
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError('');
  };

  // Calculate final total: Subtotal - Discount + Delivery Charge
  const getFinalTotal = () => {
    const deliveryCharge = calculateDeliveryCharge();
    const subtotalAfterDiscount = Math.max(0, cartTotal - discount);
    return subtotalAfterDiscount + deliveryCharge;
  };

  const openRazorpayModal = (razorpayOrderData, order) => {
    const options = {
      key: razorpayOrderData.key_id,
      amount: razorpayOrderData.order.amount,
      currency: razorpayOrderData.order.currency,
      name: 'Novara Jewels',
      description: `Order #${order._id.slice(-8).toUpperCase()}`,
      order_id: razorpayOrderData.order.id,

      prefill: {
        name: formData.customerName,
        email: formData.email,
        contact: formData.phone
      },

      // Enable all payment methods
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay using UPI',
              instruments: [
                {
                  method: 'upi'
                }
              ]
            },
            card: {
              name: 'Credit/Debit Cards',
              instruments: [
                {
                  method: 'card'
                }
              ]
            },
            netbanking: {
              name: 'Net Banking',
              instruments: [
                {
                  method: 'netbanking'
                }
              ]
            },
            wallet: {
              name: 'Wallets',
              instruments: [
                {
                  method: 'wallet'
                }
              ]
            }
          },
          sequence: ['block.upi', 'block.card', 'block.netbanking', 'block.wallet'],
          preferences: {
            show_default_blocks: true
          }
        }
      },

      handler: async function (response) {
        setProcessingPayment(true);
        await handlePaymentSuccess(response, order._id);
      },

      modal: {
        ondismiss: async function () {
          setError('Payment cancelled. Your order has been saved as pending.');

          try {
            await paymentAPI.handleFailure(order._id, {
              code: 'PAYMENT_CANCELLED',
              description: 'User closed payment modal'
            });
          } catch (err) {
            console.error('Failed to update order status:', err);
          }

          setTimeout(() => {
            navigate('/orders');
          }, 3000);
        }
      },

      theme: {
        color: '#8b7355'
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', async function (response) {
      console.error('Payment failed:', response.error);
      await handlePaymentFailure(order._id, response.error);
    });

    rzp.open();
  };

  const handlePaymentSuccess = async (response, orderId) => {
    try {
      const verificationData = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        orderId: orderId
      };

      const verificationResponse = await paymentAPI.verifyPayment(verificationData);

      if (verificationResponse.success) {
        await clearCart();

        // ✅ Show success state
        setPaymentVerified(true);

        // ✅ Redirect after showing success
        setTimeout(() => {
          navigate('/orders', {
            state: {
              paymentSuccess: true,
              orderId: orderId
            }
          });
        }, 2000); // 2 seconds to show success animation

      } else {
        throw new Error('Payment verification failed');
      }

    } catch (err) {
      console.error('Payment verification error:', err);

      if (err.response?.status === 400 && response.razorpay_payment_id) {
        await clearCart();
        setPaymentVerified(true);

        setTimeout(() => {
          navigate('/orders', {
            state: {
              paymentSuccess: true,
              orderId: orderId
            }
          });
        }, 2000);

      } else {
        setError('Payment verification failed. Please contact support.');
        setProcessingPayment(false);
      }
    }
  };

  const handlePaymentFailure = async (orderId, error) => {
    try {
      console.error('Payment failed:', error);

      await paymentAPI.handleFailure(orderId, error);

      setError(`Payment failed: ${error.description || 'Unknown error'}. Your order has been saved as pending.`);
      setProcessingPayment(false);

      // Redirect to orders after 3 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 3000);

    } catch (err) {
      console.error('Handle payment failure error:', err);
      setError('Payment failed. Please try again or contact support.');
      setProcessingPayment(false);
    }
  };

  if (processingPayment) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="processing-payment">
            {!paymentVerified ? (
              // Verifying state
              <>
                <div className="spinner"></div>
                <h2>Verifying Payment...</h2>
                <p>Please wait while we confirm your payment.</p>
                <p className="payment-note">⏳ This usually takes just a few seconds.</p>
              </>
            ) : (
              // Success state
              <>
                <div className="success-checkmark">✓</div>
                <h2 style={{ color: '#4CAF50' }}>Payment Verified!</h2>
                <p>Your order has been confirmed successfully.</p>
                <p className="payment-note">✨ Redirecting you to your orders...</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="checkout-page">
      <div className="container">

        <h1>Checkout</h1>

        <div className="checkout-layout">

          {/* Left: Checkout Form */}
          <div className="checkout-form-section">

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="checkout-form">

              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Information</h3>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <PhoneInput
                    country={'in'}
                    value={formData.phone}
                    onChange={(phone) => setFormData({ ...formData, phone: phone })}
                    inputProps={{
                      name: 'phone',
                      required: true,
                    }}
                    containerStyle={{
                      width: '100%'
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '48px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                    buttonStyle={{
                      borderRadius: '8px 0 0 8px',
                      border: '1px solid #818181ff'
                    }}
                  />
                </div>
              </div>

              {/* Delivery Address */}
              {/* Delivery Address */}
              <div className="form-section">
                <h3>Delivery Address</h3>

                <div className="form-group">
                  <label>Street Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Flat No., Street, Area"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!formData.country}
                      required
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!formData.state}
                      required
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>ZIP/Postal Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="Enter ZIP code"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="form-section">
                <h3>Payment Method</h3>
                <div className="payment-info-box">
                  <p className="payment-method-selected">
                    <strong className='color-primary'>Secure Online Payment (Razorpay)</strong>
                  </p>
                  <p className="payment-description">
                    Pay securely using your preferred payment method
                  </p>
                  <ul className="payment-features">
                    <li>✓ UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                    <li>✓ Credit/Debit Cards</li>
                    <li>✓ Net Banking</li>
                    <li>✓ Digital Wallets</li>
                    <li>✓ 100% Secure & Encrypted</li>
                  </ul>
                </div>
              </div>

              <button
                type="submit"
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? 'Initiating Payment...' : 'Proceed to Payment'}
              </button>

              <p className="secure-note">
                🔒 Your payment information is secure and encrypted
              </p>

            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary-card">
              <h3>Order Summary</h3>

              <div className="summary-items">
                {cart.map((item) => (
                  <div key={item.product._id} className="summary-item">
                    <img src={item.product.itemImage} alt={item.product.itemName} />
                    <div className="item-info">
                      <p className="item-name">{item.product.itemName}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="item-price">{formatCurrency(item.itemTotal)}</p>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              {/* Coupon Section */}
              <div className="coupon-section">
                <h4>Have a coupon?</h4>
                {!appliedCoupon ? (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="coupon-input"
                      disabled={applyingCoupon}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="apply-coupon-btn"
                      disabled={applyingCoupon}
                    >
                      {applyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="applied-coupon">
                    <div className="coupon-success">
                      <span className="coupon-badge">🎉 {appliedCoupon.code}</span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="remove-coupon-btn"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="coupon-savings">You saved {formatCurrency(discount)}!</p>
                  </div>
                )}
                {couponError && (
                  <p className="coupon-error">{couponError}</p>
                )}
              </div>

              <div className="summary-divider"></div>

              {/* Price Breakdown */}
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="summary-row discount-row">
                  <span className="discount-label">
                    Discount ({appliedCoupon.code})
                  </span>
                  <span className="discount-amount">-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Delivery Charge</span>
                <span className={calculateDeliveryCharge() === 0 ? 'free-delivery' : ''}>
                  {calculateDeliveryCharge() === 0 ? 'FREE' : formatCurrency(calculateDeliveryCharge())}
                </span>
              </div>

              <div className="summary-divider"></div>
              {cartTotal < 5000 && (
                <div className="delivery-info-note">
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    💡 {cartTotal >= 2000
                      ? `Add ₹${(5000 - cartTotal).toFixed(2)} more for FREE delivery!`
                      : `Add ₹${(2000 - cartTotal).toFixed(2)} more to reduce delivery charge to ₹300`
                    }
                  </p>
                </div>
              )}

              <div className="summary-row total">
                <span>Total</span>
                <span>{formatCurrency(getFinalTotal())}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;