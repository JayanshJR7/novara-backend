import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrder();
    }, [isAuthenticated, id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await ordersAPI.getOrderById(id);
            setOrder(data.order);
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <FiPackage />,
            confirmed: <FiCheckCircle />,
            processing: <FiPackage />,
            shipped: <FiTruck />,
            delivered: <FiCheckCircle />
        };
        return icons[status] || <FiPackage />;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#e65100',
            confirmed: '#1565c0',
            processing: '#6a1b9a',
            shipped: '#7b1fa2',
            delivered: '#2e7d32',
            cancelled: '#c62828'
        };
        return colors[status] || '#666';
    };

    if (loading) {
        return (
            <div className="order-detail-page">
                <div className="container">
                    <div className="loading">Loading order details...</div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-page">
                <div className="container">
                    <div className="error">Order not found</div>
                    <button onClick={() => navigate('/orders')} className="back-btn">
                        <FiArrowLeft /> Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-detail-page">
            <div className="container">

                <button onClick={() => navigate('/orders')} className="back-btn">
                    <FiArrowLeft /> Back to Orders
                </button>

                <div className="order-detail-header">
                    <div>
                        <h1>Order Details</h1>
                        <p className="order-id">Order ID: #{order._id.slice(-8).toUpperCase()}</p>
                        <p className="order-date">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div
                        className="order-status-badge"
                        style={{
                            backgroundColor: `${getStatusColor(order.orderStatus)}20`,
                            color: getStatusColor(order.orderStatus)
                        }}
                    >
                        {getStatusIcon(order.orderStatus)}
                        <span>{order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}</span>
                    </div>
                </div>

                <div className="order-detail-grid">

                    {/* Left: Order Items & Details */}
                    <div className="order-main-section">

                        {/* Order Items */}
                        <div className="detail-card">
                            <h3>Order Items</h3>
                            <div className="items-list">
                                {order.items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <img
                                            src={item.product?.itemImage}
                                            alt={item.product?.itemname}
                                        />
                                        <div className="item-details">
                                            <p className="item-name">{item.product?.itemname}</p>
                                            <p className="item-code">{item.product?.itemCode}</p>
                                            <p className="item-price">₹{item.price} × {item.quantity}</p>
                                        </div>
                                        <div className="item-total">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Delivery Address */}
                        <div className="detail-card">
                            <h3>Delivery Address</h3>
                            <div className="address-content">
                                <p className="name">{order.customerName}</p>
                                <p className="address">{order.address}</p>
                                <p className="contact">{order.phone}</p>
                                <p className="email">{order.email}</p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="detail-card">
                            <h3>Payment Method</h3>
                            <p className="payment-method">{order.paymentMethod.toUpperCase()}</p>
                            <p className="payment-status">
                                Status: <span className={`status-${order.paymentStatus}`}>
                                    {order.paymentStatus}
                                </span>
                            </p>
                        </div>

                    </div>

                    {/* Right: Price Summary */}
                    <div className="order-summary-section">
                        <div className="detail-card">
                            <h3>Price Summary</h3>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal?.toFixed(2)}</span>
                            </div>

                            {order.additionalCharges && order.additionalCharges.length > 0 && (
                                <>
                                    {order.additionalCharges.map((charge, index) => (
                                        <div key={index} className="summary-row">
                                            <span>{charge.chargeName}</span>
                                            <span>₹{charge.chargeAmount?.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            <div className="summary-divider"></div>

                            <div className="summary-row total">
                                <span>Total Amount</span>
                                <span>₹{order.totalAmount?.toFixed(2)}</span>
                            </div>

                            {order.trackingNumber && (
                                <div className="tracking-info">
                                    <p className="tracking-label">Tracking Number:</p>
                                    <p className="tracking-number">{order.trackingNumber}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default OrderDetail;