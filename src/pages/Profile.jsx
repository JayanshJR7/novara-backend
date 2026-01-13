import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { FiUser, FiMail, FiShield, FiPackage, FiArrowLeft } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserOrders();
  }, [isAuthenticated]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getUserOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft /> Back
        </button>
        <h1 className="page-title">My Profile</h1>

        <div className="profile-grid">
          
          {/* Left: User Info Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2>{user.name}</h2>
              {user.isAdmin && (
                <span className="admin-badge">
                  <FiShield /> Admin
                </span>
              )}
            </div>

            <div className="profile-info">
              <div className="info-item">
                <FiUser className="info-icon" />
                <div>
                  <p className="info-label">Full Name</p>
                  <p className="info-value">{user.name}</p>
                </div>
              </div>

              <div className="info-item">
                <FiMail className="info-icon" />
                <div>
                  <p className="info-label">Email Address</p>
                  <p className="info-value">{user.email}</p>
                </div>
              </div>

              <div className="info-item">
                <FiPackage className="info-icon" />
                <div>
                  <p className="info-label">Total Orders</p>
                  <p className="info-value">{orders.length}</p>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              {user.isAdmin && (
                <button 
                  className="btn-admin"
                  onClick={() => navigate('/admin')}
                >
                  Admin Dashboard
                </button>
              )}
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Right: Recent Orders */}
          <div className="orders-section">
            <h3>Recent Orders</h3>

            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : orders.length > 0 ? (
              <div className="orders-list">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">Order #{order._id.slice(-6)}</span>
                      <span className={`order-status ${order.orderStatus}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="order-details">
                      <p>{order.items.length} item(s)</p>
                      <p className="order-total">₹{order.totalAmount}</p>
                    </div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-orders">
                <p>No orders yet</p>
                <button onClick={() => navigate('/products')}>
                  Start Shopping
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;