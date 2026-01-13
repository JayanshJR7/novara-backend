import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI, ordersAPI, couponsAPI, categoriesAPI, reviewsAPI, carouselAPI } from '../services/api';
import api from '../services/api';

import { FaRupeeSign } from 'react-icons/fa';
import {
    FiPackage,
    FiShoppingBag,
    FiTrendingUp,
    FiPlus,
    FiEdit,
    FiTrash2,
    FiX,
    FiEye,
    FiTruck,
    FiCheck,
    FiXCircle,
    FiImage,
    FiUpload,
} from 'react-icons/fi';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminDashboard.css';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
    });

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    //carousel state
    const [carouselSlides, setCarouselSlides] = useState([]);
    const [showCarouselModal, setShowCarouselModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [slideForm, setSlideForm] = useState({
        title: '',
        subtitle: '',
        image: null,
        imagePreview: ''
    });
    const [uploadingSlide, setUploadingSlide] = useState(false);

    //coupn states
    const [coupons, setCoupons] = useState([]);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [couponForm, setCouponForm] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        expiresAt: '',
        usageLimit: '',
        description: ''
    });

    // Order preview modal states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState('');

    //category states
    const [categoryList, setCategoryList] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        slug: '',
        displayOrder: 0,
        showInNavbar: true,
        description: ''
    });
    //review states
    const [reviews, setReviews] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const formatNumber = (num) => {
        if (num >= 1000000000) {
            return '₹' + (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return '₹' + (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return '₹' + (num / 1000).toFixed(2) + 'K';
        }
        return '₹' + num.toFixed(2);
    };
    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, [isAdmin, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [productsData, ordersData, couponsData, categoriesData, reviewsData] = await Promise.allSettled([
                productsAPI.getAll(),
                ordersAPI.getAllOrders(),
                couponsAPI.getAll(),
                categoriesAPI.getAll(),
                reviewsAPI.getAllAdmin(),
            ]);

            // Handle products
            if (productsData.status === 'fulfilled') {
                setProducts(productsData.value.products || []);
            } else {
                console.error('Failed to fetch products:', productsData.reason);
                setProducts([]);
            }

            // Handle orders
            if (ordersData.status === 'fulfilled') {
                setOrders(ordersData.value.orders || []);

                const confirmedOrders = (ordersData.value.orders || []).filter(
                    o => o.orderStatus === 'confirmed' ||
                        o.orderStatus === 'processing' ||
                        o.orderStatus === 'shipped' ||
                        o.orderStatus === 'delivered'
                );

                const totalRevenue = confirmedOrders.reduce(
                    (sum, order) => sum + (order.totalAmount || 0),
                    0
                );

                // Update stats
                setStats({
                    totalProducts: productsData.status === 'fulfilled'
                        ? (productsData.value.products?.length || 0)
                        : 0,
                    totalOrders: ordersData.value.orders?.length || 0,
                    pendingOrders: (ordersData.value.orders || []).filter(o => o.orderStatus === 'pending').length || 0,
                    totalRevenue: totalRevenue
                });
            } else {
                console.error('Failed to fetch orders:', ordersData.reason);
                setOrders([]);
            }

            // Handle coupons
            if (couponsData.status === 'fulfilled') {
                setCoupons(couponsData.value.coupons || []);
            } else {
                console.error('Failed to fetch coupons:', couponsData.reason);
                setCoupons([]);
            }

            if (categoriesData.status === 'fulfilled') {
                setCategoryList(categoriesData.value.categories || []);
            } else {
                console.error('Failed to fetch categories:', categoriesData.reason);
                setCategoryList([]);
            }
            if (reviewsData.status === 'fulfilled') {
                setReviews(reviewsData.value.reviews || []);
            } else {
                console.error('Failed to fetch reviews:', reviewsData.reason);
                setReviews([]);
            }

            // Fetch carousel slides separately (doesn't break if it fails)
            await fetchCarouselSlides();
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load some dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchCarouselSlides = async () => {
        try {
            const response = await fetch('/api/carousel/slides');

            if (!response.ok) {
                throw new Error('Carousel API failed');
            }

            const data = await response.json();

            setCarouselSlides(Array.isArray(data?.slides) ? data.slides : []);
        } catch (error) {
            console.error('Failed to fetch carousel slides:', error);
            setCarouselSlides([]); // ✅ fallback
        }
    };



    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await productsAPI.deleteProduct(id);
            toast.success('Product deleted successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to delete product:', error);
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    const handleConfirmOrder = async (orderId) => {
        try {
            await ordersAPI.updateOrder(orderId, { orderStatus: 'confirmed' });
            toast.success('Order confirmed successfully!');
            fetchDashboardData();
            if (showOrderModal && selectedOrder?._id === orderId) {
                setShowOrderModal(false);
            }
        } catch (error) {
            console.error('Failed to confirm order:', error);
            toast.error('Failed to confirm order');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await ordersAPI.updateOrder(orderId, { orderStatus: 'cancelled' });
            toast.success('Order cancelled successfully!');
            fetchDashboardData();
            if (showOrderModal && selectedOrder?._id === orderId) {
                setShowOrderModal(false);
            }
        } catch (error) {
            console.error('Failed to cancel order:', error);
            toast.error('Failed to cancel order');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateOrder(orderId, { orderStatus: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to update order:', error);
            toast.error('Failed to update order status');
        }
    };

    const handleUpdateDeliveryCharge = async (orderId) => {
        if (!deliveryCharge || parseFloat(deliveryCharge) < 0) {
            toast.error('Please enter a valid delivery charge');
            return;
        }

        try {
            const charge = parseFloat(deliveryCharge);
            const itemsTotal = selectedOrder.totalAmount - (selectedOrder.deliveryCharge || 0);
            await ordersAPI.updateOrder(orderId, {
                deliveryCharge: charge,
                totalAmount: itemsTotal + charge
            });
            toast.success('Delivery charge updated successfully!');
            setDeliveryCharge('');
            fetchDashboardData();
            setShowOrderModal(false);
        } catch (error) {
            console.error('Failed to update delivery charge:', error);
            toast.error('Failed to update delivery charge');
        }
    };

    const handleAddCoupon = () => {
        setEditingCoupon(null);
        setCouponForm({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            minOrderAmount: '',
            maxDiscount: '',
            expiresAt: '',
            usageLimit: '',
            description: ''
        });
        setShowCouponModal(true);
    };

    const handleEditCoupon = (coupon) => {
        setEditingCoupon(coupon);
        setCouponForm({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toString(),
            minOrderAmount: coupon.minOrderAmount?.toString() || '',
            maxDiscount: coupon.maxDiscount?.toString() || '',
            expiresAt: new Date(coupon.expiresAt).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit?.toString() || '',
            description: coupon.description || ''
        });
        setShowCouponModal(true);
    };

    const handleSaveCoupon = async () => {
        // Validation
        if (!couponForm.code || !couponForm.discountValue || !couponForm.expiresAt) {
            toast.error('Please fill in all required fields (Code, Discount Value, Expiry Date)');
            return;
        }

        // Additional validation
        if (couponForm.discountType === 'percentage' && (parseFloat(couponForm.discountValue) <= 0 || parseFloat(couponForm.discountValue) > 100)) {
            toast.error('Percentage discount must be between 1 and 100');
            return;
        }

        if (couponForm.discountType === 'fixed' && parseFloat(couponForm.discountValue) <= 0) {
            toast.error('Fixed discount must be greater than 0');
            return;
        }

        try {
            const couponData = {
                code: couponForm.code.trim().toUpperCase(),
                discountType: couponForm.discountType,
                discountValue: parseFloat(couponForm.discountValue),
                minOrderAmount: couponForm.minOrderAmount ? parseFloat(couponForm.minOrderAmount) : 0,
                maxDiscount: couponForm.maxDiscount ? parseFloat(couponForm.maxDiscount) : null,
                expiresAt: couponForm.expiresAt,
                usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null,
                description: couponForm.description || ''
            };

            if (editingCoupon) {
                const response = await couponsAPI.update(editingCoupon._id, couponData);

                // Update the specific coupon in state
                setCoupons(prevCoupons =>
                    prevCoupons.map(coupon =>
                        coupon._id === editingCoupon._id
                            ? { ...coupon, ...couponData, _id: editingCoupon._id }
                            : coupon
                    )
                );

                toast.success('Coupon updated successfully!');
            } else {
                const response = await couponsAPI.create(couponData);

                // Add the new coupon to state
                if (response.coupon) {
                    setCoupons(prevCoupons => [response.coupon, ...prevCoupons]);
                } else {
                    // If response doesn't include coupon, fetch all coupons
                    const couponsData = await couponsAPI.getAll();
                    setCoupons(couponsData.coupons || []);
                }

                toast.success('Coupon created successfully!');
            }

            setShowCouponModal(false);
        } catch (error) {
            console.error('❌ Error saving coupon:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error(error.response?.data?.message || 'Failed to save coupon. Check console for details.');
        }
    };

    const handleToggleCoupon = async (id) => {
        try {
            const response = await couponsAPI.toggle(id);

            // Update the specific coupon in state without refetching
            setCoupons(prevCoupons =>
                prevCoupons.map(coupon =>
                    coupon._id === id
                        ? { ...coupon, isActive: !coupon.isActive }
                        : coupon
                )
            );

            toast.success('Coupon status updated!');
        } catch (error) {
            console.error('❌ Error toggling coupon:', error);
            toast.error('Failed to update coupon status. Check console for details.');
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) {
            return;
        }

        try {
            const response = await couponsAPI.delete(id);
            // Update the coupons state directly without refetching all data
            setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon._id !== id));

            toast.success('Coupon deleted successfully!');
        } catch (error) {
            console.error('❌ Error deleting coupon:', error);
            toast.error('Failed to delete coupon. Check console for details.');
        }
    };

    const handleSlideImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setSlideForm({
                ...slideForm,
                image: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    const handleAddSlide = () => {
        setEditingSlide(null);
        setSlideForm({
            title: '',
            subtitle: '',
            image: null,
            imagePreview: ''
        });
        setShowCarouselModal(true);
    };

    const handleEditSlide = (slide) => {
        setEditingSlide(slide);
        setSlideForm({
            title: slide.title,
            subtitle: slide.subtitle,
            image: null,
            imagePreview: slide.image
        });
        setShowCarouselModal(true);
    };

    const handleSaveSlide = async () => {
        try {
            setUploadingSlide(true);

            const formData = new FormData();
            formData.append('title', slideForm.title);
            formData.append('subtitle', slideForm.subtitle);
            if (slideForm.image) formData.append('image', slideForm.image);

            if (editingSlide) {
                await api.put(`/carousel/slides/${editingSlide._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/carousel/slides', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            toast.success(editingSlide ? 'Slide updated!' : 'Slide added!');
            setShowCarouselModal(false);
            fetchCarouselSlides();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to save slide');
        } finally {
            setUploadingSlide(false);
        }
    };

    const handleDeleteSlide = async (slideId) => {
        if (!window.confirm('Delete this slide?')) return;

        try {
            await api.delete(`/carousel/slides/${slideId}`);
            toast.success('Slide deleted');
            fetchCarouselSlides();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete slide');
        }
    };


    const closeCarouselModal = () => {
        setShowCarouselModal(false);
        setEditingSlide(null);
        if (slideForm.imagePreview && slideForm.image) {
            URL.revokeObjectURL(slideForm.imagePreview);
        }
        setSlideForm({
            title: '',
            subtitle: '',
            image: null,
            imagePreview: ''
        });
    };

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setDeliveryCharge(order.deliveryCharge?.toString() || '');
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
        setDeliveryCharge('');
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setCategoryForm({
            name: '',
            slug: '',
            displayOrder: 0,
            showInNavbar: true,
            description: ''
        });
        setShowCategoryModal(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            slug: category.slug,
            displayOrder: category.displayOrder,
            showInNavbar: category.showInNavbar,
            description: category.description || ''
        });
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async () => {
        if (!categoryForm.name.trim()) {
            toast.error('Please enter category name');
            return;
        }

        try {
            const categoryData = {
                name: categoryForm.name.trim(),
                slug: categoryForm.slug.trim() || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                displayOrder: parseInt(categoryForm.displayOrder) || 0,
                showInNavbar: categoryForm.showInNavbar,
                description: categoryForm.description.trim()
            };

            if (editingCategory) {
                await categoriesAPI.update(editingCategory._id, categoryData);
                toast.success('Category updated successfully!');
            } else {
                await categoriesAPI.create(categoryData);
                toast.success('Category created successfully!');
            }

            setShowCategoryModal(false);
            fetchDashboardData();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const handleToggleCategory = async (id) => {
        try {
            await categoriesAPI.toggle(id);
            toast.success('Category status updated!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error toggling category:', error);
            toast.error('Failed to update category status');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            await categoriesAPI.delete(id);
            toast.success('Category deleted successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };
    const handleApproveReview = async (id) => {
        try {
            await reviewsAPI.approve(id);
            toast.success('Review approved successfully!');
            fetchDashboardData();
            if (showReviewModal && selectedReview?._id === id) {
                setShowReviewModal(false);
            }
        } catch (error) {
            console.error('Error approving review:', error);
            toast.error('Failed to approve review');
        }
    };

    const handleToggleReview = async (id) => {
        try {
            await reviewsAPI.toggle(id);
            toast.success('Review status updated!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error toggling review:', error);
            toast.error('Failed to update review status');
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            await reviewsAPI.delete(id);
            toast.success('Review deleted successfully!');
            fetchDashboardData();
            if (showReviewModal && selectedReview?._id === id) {
                setShowReviewModal(false);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const openReviewModal = (review) => {
        setSelectedReview(review);
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedReview(null);
    };


    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: '#300708',
                fontSize: '20px',
                fontWeight: '600'
            }}>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="admin-dashboard-new">
            <Navbar />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="container">
                <div className="dashboard-header-new">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, {user?.name}</p>
                </div>

                <div className="stats-grid-new">
                    <div className="stat-card-new">
                        <div className="stat-icon-new" style={{ background: 'rgba(48, 7, 8, 0.1)' }}>
                            <FiShoppingBag size={32} style={{ color: '#300708' }} />
                        </div>
                        <div className="stat-info-new">
                            <p className="stat-label-new">Total Products</p>
                            <p className="stat-value-new">{stats.totalProducts}</p>
                        </div>
                    </div>

                    <div className="stat-card-new">
                        <div className="stat-icon-new" style={{ background: 'rgba(48, 7, 8, 0.1)' }}>
                            <FiPackage size={32} style={{ color: '#300708' }} />
                        </div>
                        <div className="stat-info-new">
                            <p className="stat-label-new">Total Orders</p>
                            <p className="stat-value-new">{stats.totalOrders}</p>
                        </div>
                    </div>

                    <div className="stat-card-new">
                        <div className="stat-icon-new" style={{ background: 'rgba(48, 7, 8, 0.1)' }}>
                            <FiTrendingUp size={32} style={{ color: '#300708' }} />
                        </div>
                        <div className="stat-info-new">
                            <p className="stat-label-new">Pending Orders</p>
                            <p className="stat-value-new">{stats.pendingOrders}</p>
                        </div>
                    </div>

                    <div className="stat-card-new">
                        <div className="stat-icon-new" style={{ background: 'rgba(48, 7, 8, 0.1)' }}>
                            <FaRupeeSign size={32} style={{ color: 'green' }} />
                        </div>
                        <div className="stat-info-new">
                            <p className="stat-label-new">Total Revenue</p>
                            <p className="stat-value-new">{formatNumber(stats.totalRevenue)}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-tabs-new">
                    <button
                        className={`tab-new ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-new ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                    <button
                        className={`tab-new ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button
                        className={`tab-new ${activeTab === 'carousel' ? 'active' : ''}`}
                        onClick={() => setActiveTab('carousel')}
                    >
                        Carousel
                    </button>
                    <button
                        className={`tab-new ${activeTab === 'coupons' ? 'active' : ''}`}
                        onClick={() => setActiveTab('coupons')}
                    >
                        Coupons
                    </button>
                    <button
                        className={`tab-new ${activeTab === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categories
                    </button>
                    <button
                        className={`tab-new ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews
                    </button>
                </div>

                <div className="tab-content-new">
                    {activeTab === 'overview' && (
                        <div className="overview-section-new">
                            <h2>Quick Actions</h2>
                            <div className="quick-actions-new">
                                <button
                                    className="action-btn-new"
                                    onClick={() => navigate('/admin/add-product')}
                                >
                                    <FiPlus /> Add New Product
                                </button>
                                <button
                                    className="action-btn-new"
                                    onClick={() => setActiveTab('orders')}
                                >
                                    <FiPackage /> View Orders
                                </button>
                                <button
                                    className="action-btn-new"
                                    onClick={() => setActiveTab('carousel')}
                                >
                                    <FiImage /> Manage Carousel
                                </button>
                                <button
                                    className="action-btn-new"
                                    onClick={() => navigate('/admin/revenue-analytics')}
                                >
                                    <FiTrendingUp /> View Revenue Analytics
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="products-section-new">
                            <div className="section-header-new">
                                <h2>All Products</h2>
                                <button
                                    className="btn-add-new"
                                    onClick={() => navigate('/admin/add-product')}
                                >
                                    <FiPlus /> Add Product
                                </button>
                            </div>

                            <div className="products-table-new">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Code</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product._id}>
                                                <td>
                                                    <img
                                                        src={product.itemImage}
                                                        alt={product.itemname}
                                                        className="product-thumb-new"
                                                    />
                                                </td>
                                                <td>{product.itemname}</td>
                                                <td>{product.itemCode}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                                                            ₹{product.basePrice?.toFixed(2)}
                                                        </span>
                                                        <span style={{ fontWeight: '600', color: '#300708' }}>
                                                            ₹{product.finalPrice?.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`stock-badge-new ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons-new">
                                                        <button
                                                            className="btn-edit-new"
                                                            onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                                                            title="Edit Product"
                                                        >
                                                            <FiEdit />
                                                        </button>
                                                        <button
                                                            className="btn-delete-new"
                                                            onClick={() => handleDeleteProduct(product._id)}
                                                            title="Delete Product"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="orders-section-new">
                            <h2>All Orders</h2>

                            <div className="orders-table-new">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order._id}>
                                                <td>#{order._id.slice(-6)}</td>
                                                <td>{order.customerName}</td>
                                                <td>{order.items?.length || 0} items</td>
                                                <td>₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                                                <td>
                                                    <span className={`status-badge-new status-${order.orderStatus}`}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="order-actions-new">
                                                        <button
                                                            className="btn-view-new"
                                                            onClick={() => openOrderModal(order)}
                                                            title="View Details"
                                                        >
                                                            <FiEye />
                                                        </button>
                                                        {order.orderStatus === 'pending' && (
                                                            <>
                                                                <button
                                                                    className="btn-confirm-new"
                                                                    onClick={() => handleConfirmOrder(order._id)}
                                                                    title="Confirm Order"
                                                                >
                                                                    <FiCheck />
                                                                </button>
                                                                <button
                                                                    className="btn-cancel-new"
                                                                    onClick={() => handleCancelOrder(order._id)}
                                                                    title="Cancel Order"
                                                                >
                                                                    <FiXCircle />
                                                                </button>
                                                            </>
                                                        )}
                                                        {(order.orderStatus === 'confirmed' || order.orderStatus === 'processing') && (
                                                            <button
                                                                className="btn-cancel-new"
                                                                onClick={() => handleCancelOrder(order._id)}
                                                                title="Cancel Order"
                                                            >
                                                                <FiXCircle />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'carousel' && (
                        <div className="carousel-section-new">
                            <div className="section-header-new">
                                <h2>Carousel Slides</h2>
                                <button
                                    className="btn-add-new"
                                    onClick={handleAddSlide}
                                >
                                    <FiPlus /> Add Slide
                                </button>
                            </div>

                            <div className="carousel-grid-new">
                                {carouselSlides.map((slide) => (
                                    <div key={slide._id} className="carousel-slide-card">
                                        <div className="slide-image-wrapper">
                                            <img src={slide.image} alt={slide.title} />
                                        </div>
                                        <div className="slide-info">
                                            <h3>{slide.title}</h3>
                                            <p>{slide.subtitle}</p>
                                        </div>
                                        <div className="slide-actions">
                                            <button
                                                className="btn-edit-new"
                                                onClick={() => handleEditSlide(slide)}
                                                title="Edit Slide"
                                            >
                                                <FiEdit />
                                            </button>
                                            <button
                                                className="btn-delete-new"
                                                onClick={() => handleDeleteSlide(slide._id)}
                                                title="Delete Slide"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {carouselSlides.length === 0 && (
                                <div className="empty-state">
                                    <FiImage size={64} style={{ color: '#ccc' }} />
                                    <p>No carousel slides yet. Add your first slide!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'coupons' && (
                        <div className="coupons-section-new">
                            <div className="section-header-new">
                                <h2>Coupon Codes</h2>
                                <button
                                    className="btn-add-new"
                                    onClick={handleAddCoupon}
                                >
                                    <FiPlus /> Add Coupon
                                </button>
                            </div>

                            <div className="coupons-table-new">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Type</th>
                                            <th>Value</th>
                                            <th>Min Order</th>
                                            <th>Used/Limit</th>
                                            <th>Expires</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.map((coupon) => (
                                            <tr key={coupon._id}>
                                                <td>
                                                    <strong style={{ color: '#300708', fontSize: '16px' }}>
                                                        {coupon.code}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span className="coupon-type-badge">
                                                        {coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {coupon.discountType === 'percentage'
                                                        ? `${coupon.discountValue}%`
                                                        : `₹${coupon.discountValue}`
                                                    }
                                                    {coupon.maxDiscount && (
                                                        <span style={{ fontSize: '12px', color: '#666' }}>
                                                            {' '}(max: ₹{coupon.maxDiscount})
                                                        </span>
                                                    )}
                                                </td>
                                                <td>₹{coupon.minOrderAmount || 0}</td>
                                                <td>
                                                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                                                </td>
                                                <td>{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge-new ${coupon.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons-new">
                                                        <button
                                                            className={`btn-${coupon.isActive ? 'cancel' : 'confirm'}-new`}
                                                            onClick={() => handleToggleCoupon(coupon._id)}
                                                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {coupon.isActive ? <FiXCircle /> : <FiCheck />}
                                                        </button>
                                                        <button
                                                            className="btn-edit-new"
                                                            onClick={() => handleEditCoupon(coupon)}
                                                            title="Edit Coupon"
                                                        >
                                                            <FiEdit />
                                                        </button>
                                                        <button
                                                            className="btn-delete-new"
                                                            onClick={() => handleDeleteCoupon(coupon._id)}
                                                            title="Delete Coupon"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {coupons.length === 0 && (
                                <div className="empty-state">
                                    <FaRupeeSign size={64} style={{ color: '#ccc' }} />
                                    <p>No coupons yet. Create your first coupon!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'categories' && (
                        <div className="categories-section-new">
                            <div className="section-header-new">
                                <h2>Product Categories</h2>
                                <button
                                    className="btn-add-new"
                                    onClick={handleAddCategory}
                                >
                                    <FiPlus /> Add Category
                                </button>
                            </div>

                            <div className="categories-table-new">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Slug</th>
                                            <th>In Navbar</th>
                                            <th>Order</th>
                                            <th>Products</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryList.map((category) => (
                                            <tr key={category._id}>
                                                <td><strong style={{ color: '#300708' }}>{category.name}</strong></td>
                                                <td><code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: '4px' }}>{category.slug}</code></td>
                                                <td>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        background: category.showInNavbar ? '#e8f5e9' : '#f5f5f5',
                                                        color: category.showInNavbar ? '#2e7d32' : '#666'
                                                    }}>
                                                        {category.showInNavbar ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td>{category.displayOrder}</td>
                                                <td>{category.productCount || 0}</td>
                                                <td>
                                                    <span className={`status-badge-new ${category.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                                                        {category.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons-new">
                                                        <button
                                                            className={`btn-${category.isActive ? 'cancel' : 'confirm'}-new`}
                                                            onClick={() => handleToggleCategory(category._id)}
                                                            title={category.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {category.isActive ? <FiXCircle /> : <FiCheck />}
                                                        </button>
                                                        <button
                                                            className="btn-edit-new"
                                                            onClick={() => handleEditCategory(category)}
                                                            title="Edit Category"
                                                        >
                                                            <FiEdit />
                                                        </button>
                                                        <button
                                                            className="btn-delete-new"
                                                            onClick={() => handleDeleteCategory(category._id)}
                                                            title="Delete Category"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {categoryList.length === 0 && (
                                <div className="empty-state">
                                    <p>No categories yet. Add your first category!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="reviews-section-new">
                            <div className="section-header-new">
                                <h2>Customer Reviews</h2>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Pending Approval: {reviews.filter(r => !r.isApproved).length}
                                </div>
                            </div>

                            <div className="reviews-table-new">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Rating</th>
                                            <th>Title</th>
                                            <th>Review</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map((review) => (
                                            <tr key={review._id}>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <strong style={{ color: '#300708' }}>{review.name}</strong>
                                                        {review.verified && (
                                                            <span style={{
                                                                fontSize: '11px',
                                                                color: '#10b981',
                                                                background: '#e8f5e9',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                width: 'fit-content'
                                                            }}>
                                                                ✓ Verified Purchase
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '2px' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} style={{
                                                                color: i < review.rating ? '#d4af37' : '#ddd',
                                                                fontSize: '16px'
                                                            }}>
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ maxWidth: '200px' }}>
                                                    <div style={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        fontWeight: '500'
                                                    }}>
                                                        {review.title}
                                                    </div>
                                                </td>
                                                <td style={{ maxWidth: '300px' }}>
                                                    <div style={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        fontSize: '14px',
                                                        color: '#666'
                                                    }}>
                                                        {review.review}
                                                    </div>
                                                </td>
                                                <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span className={`status-badge-new ${review.isApproved ? 'status-confirmed' : 'status-pending'}`}>
                                                            {review.isApproved ? 'Approved' : 'Pending'}
                                                        </span>
                                                        <span className={`status-badge-new ${review.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                                                            {review.isActive ? 'Active' : 'Hidden'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="action-buttons-new">
                                                        <button
                                                            className="btn-view-new"
                                                            onClick={() => openReviewModal(review)}
                                                            title="View Details"
                                                        >
                                                            <FiEye />
                                                        </button>
                                                        {!review.isApproved && (
                                                            <button
                                                                className="btn-confirm-new"
                                                                onClick={() => handleApproveReview(review._id)}
                                                                title="Approve Review"
                                                            >
                                                                <FiCheck />
                                                            </button>
                                                        )}
                                                        <button
                                                            className={`btn-${review.isActive ? 'cancel' : 'confirm'}-new`}
                                                            onClick={() => handleToggleReview(review._id)}
                                                            title={review.isActive ? 'Hide Review' : 'Show Review'}
                                                        >
                                                            {review.isActive ? <FiXCircle /> : <FiCheck />}
                                                        </button>
                                                        <button
                                                            className="btn-delete-new"
                                                            onClick={() => handleDeleteReview(review._id)}
                                                            title="Delete Review"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {reviews.length === 0 && (
                                <div className="empty-state">
                                    <p>No reviews yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="modal-overlay-new" onClick={closeOrderModal}>
                    <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-new">
                            <h2>Order Details</h2>
                            <button className="close-modal-btn" onClick={closeOrderModal}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="modal-body-new">
                            <div className="order-info-section">
                                <h3>Order Information</h3>
                                <p><strong>Order ID:</strong>{selectedOrder._id.slice(-6)}</p>
                                <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                                <p><strong>Email:</strong> {selectedOrder.email}</p>
                                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                                <p><strong>Status:</strong> <span className={`status-badge-new status-${selectedOrder.orderStatus}`}>
                                    {selectedOrder.orderStatus}
                                </span></p>
                                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="order-info-section">
                                <h3>Shipping Address</h3>
                                <div className="shipping-address-details">
                                    <div className="address-row">
                                        <span className="address-label">Street Address:</span>
                                        <span className="address-value">{selectedOrder.shippingAddress?.address || 'N/A'}</span>
                                    </div>
                                    <div className="address-row">
                                        <span className="address-label">City:</span>
                                        <span className="address-value">{selectedOrder.shippingAddress?.city || 'N/A'}</span>
                                    </div>
                                    <div className="address-row">
                                        <span className="address-label">State:</span>
                                        <span className="address-value">{selectedOrder.shippingAddress?.state || 'N/A'}</span>
                                    </div>
                                    <div className="address-row">
                                        <span className="address-label">Country:</span>
                                        <span className="address-value">{selectedOrder.shippingAddress?.country || 'N/A'}</span>
                                    </div>
                                    <div className="address-row">
                                        <span className="address-label">ZIP Code:</span>
                                        <span className="address-value">{selectedOrder.shippingAddress?.zipCode || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="order-info-section">
                                <h3>Payment Summary</h3>
                                <div className="payment-summary">
                                    <p><strong>Amount paid:</strong>₹{selectedOrder.paymentInfo.amount_paid}</p>
                                    <p><strong>Payment platform (method):</strong>{selectedOrder.paymentMethod}</p>
                                    <p><strong>Razorpay Order ID:</strong>{selectedOrder.paymentInfo.razorpay_order_id}</p>
                                    <p><strong>Razorpay Payment ID:</strong>{selectedOrder.paymentInfo.razorpay_payment_id}</p>
                                    <p><strong>Razorpay Signature -</strong></p>
                                    <p style={{ overflowX: 'scroll' }}>{selectedOrder.paymentInfo.razorpay_signature}</p>
                                    <p><strong>Payment Method:</strong>{selectedOrder.paymentInfo.payment_method}</p>
                                    <p>
                                        <strong>Payment Date:</strong>{" "}
                                        {new Date(selectedOrder.paymentInfo.payment_date).toLocaleString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true
                                            }
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="order-info-section">
                                <h3>Order Items</h3>
                                <div className="order-items-list">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="order-item-row">
                                            <img src={item.product.itemImage} alt={item.product.itemname} loading='lazy' className="item-image-modal" />
                                            <div className="item-details-modal">
                                                <p><strong>{item.product.itemname}</strong></p>
                                                <p>Code: {item.product.itemCode}</p>
                                                <p>Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="item-price-modal">
                                                <p>₹{item.price?.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="order-info-section">
                                <h3>Payment Summary</h3>
                                <div className="payment-summary">
                                    <p><strong>Subtotal:</strong> ₹{(selectedOrder.totalAmount - (selectedOrder.deliveryCharge || 0)).toFixed(2)}</p>
                                    <p><strong>Delivery Charge:</strong> ₹{(selectedOrder.deliveryCharge || 0).toFixed(2)}</p>
                                    <p className="total-amount"><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="modal-actions">
                                {selectedOrder.orderStatus === 'pending' && (
                                    <>
                                        <button
                                            className="btn-modal-confirm"
                                            onClick={() => handleConfirmOrder(selectedOrder._id)}
                                        >
                                            <FiCheck /> Confirm Order
                                        </button>
                                        <button
                                            className="btn-modal-cancel"
                                            onClick={() => handleCancelOrder(selectedOrder._id)}
                                        >
                                            <FiXCircle /> Cancel Order
                                        </button>
                                    </>
                                )}
                                {(selectedOrder.orderStatus === 'confirmed' || selectedOrder.orderStatus === 'processing') && (
                                    <button
                                        className="btn-modal-cancel"
                                        onClick={() => handleCancelOrder(selectedOrder._id)}
                                    >
                                        <FiXCircle /> Cancel Order
                                    </button>
                                )}
                                {selectedOrder.orderStatus === 'confirmed' && (
                                    <button
                                        className="btn-modal-process"
                                        onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'processing')}
                                    >
                                        Mark as Processing
                                    </button>
                                )}
                                {selectedOrder.orderStatus === 'processing' && (
                                    <button
                                        className="btn-modal-process"
                                        onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'shipped')}
                                    >
                                        Mark as Shipped
                                    </button>
                                )}
                                {selectedOrder.orderStatus === 'shipped' && (
                                    <button
                                        className="btn-modal-process"
                                        onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'delivered')}
                                    >
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Carousel Slide Modal */}
            {showCarouselModal && (
                <div className="modal-overlay-new" onClick={closeCarouselModal}>
                    <div className="carousel-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="carousel-modal-header">
                            <h2>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h2>
                            <button className="close-modal-btn" onClick={closeCarouselModal}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="carousel-modal-body">
                            <div className="form-group-carousel">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={slideForm.title}
                                    onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                                    placeholder="Enter slide title"
                                    maxLength={100}
                                />
                            </div>

                            <div className="form-group-carousel">
                                <label>Subtitle *</label>
                                <textarea
                                    value={slideForm.subtitle}
                                    onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                                    placeholder="Enter slide subtitle"
                                    maxLength={200}
                                    rows={3}
                                />
                            </div>

                            <div className="form-group-carousel">
                                <label>Image * {editingSlide && '(Leave empty to keep current image)'}</label>
                                <div
                                    className={`image-upload-area ${slideForm.imagePreview ? 'has-image' : ''}`}
                                    onClick={() => document.getElementById('carousel-image-input').click()}
                                >
                                    {slideForm.imagePreview ? (
                                        <div className="image-preview-wrapper">
                                            <img src={slideForm.imagePreview} alt="Preview" />
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <FiUpload size={48} className="upload-icon" />
                                            <p className="upload-text">Click to upload carousel image</p>
                                            <p className="upload-hint">Recommended: 1920x1080px, Max 5MB</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="carousel-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleSlideImageChange}
                                    className="image-upload-input"
                                />
                            </div>
                        </div>

                        <div className="modal-actions-carousel">
                            <button
                                className="btn-cancel-carousel"
                                onClick={closeCarouselModal}
                                disabled={uploadingSlide}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-save-carousel"
                                onClick={handleSaveSlide}
                                disabled={uploadingSlide}
                            >
                                {uploadingSlide ? 'Saving...' : editingSlide ? 'Update Slide' : 'Add Slide'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Coupon Modal */}
            {showCouponModal && (
                <div className="modal-overlay-new" onClick={() => setShowCouponModal(false)}>
                    <div className="carousel-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="carousel-modal-header">
                            <h2>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                            <button className="close-modal-btn" onClick={() => setShowCouponModal(false)}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="carousel-modal-body">
                            <div className="form-group-carousel">
                                <label>Coupon Code *</label>
                                <input
                                    type="text"
                                    value={couponForm.code}
                                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., WOW40"
                                    maxLength={20}
                                    disabled={editingCoupon}
                                />
                            </div>

                            <div className="form-group-carousel">
                                <label>Discount Type *</label>
                                <select
                                    value={couponForm.discountType}
                                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>

                            <div className="form-group-carousel">
                                <label>
                                    Discount Value *
                                    {couponForm.discountType === 'percentage' ? ' (%)' : ' (₹)'}
                                </label>
                                <input
                                    type="number"
                                    className='coupon-inputs'
                                    value={couponForm.discountValue}
                                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                                    placeholder={couponForm.discountType === 'percentage' ? 'e.g., 40' : 'e.g., 500'}
                                    min="0"
                                    max={couponForm.discountType === 'percentage' ? '100' : undefined}
                                />
                            </div>

                            {couponForm.discountType === 'percentage' && (
                                <div className="form-group-carousel">
                                    <label>Max Discount Amount (₹)</label>
                                    <input
                                        type="number"
                                        className='coupon-inputs'
                                        value={couponForm.maxDiscount}
                                        onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                                        placeholder="e.g., 1000 (optional)"
                                        min="0"
                                    />
                                </div>
                            )}

                            <div className="form-group-carousel">
                                <label>Minimum Order Amount (₹)</label>
                                <input
                                    type="number"
                                    className='coupon-inputs'
                                    value={couponForm.minOrderAmount}
                                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                                    placeholder="e.g., 2000 (optional)"
                                    min="0"
                                />
                            </div>

                            <div className="form-group-carousel">
                                <label>Expiry Date *</label>
                                <input
                                    type="date"
                                    className='coupon-inputs'
                                    value={couponForm.expiresAt}
                                    onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="form-group-carousel">
                                <label>Usage Limit</label>
                                <input
                                    type="number"
                                    className='coupon-inputs'
                                    value={couponForm.usageLimit}
                                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                                    placeholder="Leave empty for unlimited"
                                    min="1"
                                />
                            </div>

                            <div className="form-group-carousel">
                                <label>Description</label>
                                <textarea
                                    value={couponForm.description}
                                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                                    placeholder="e.g., New Year Sale"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="modal-actions-carousel">
                            <button
                                className="btn-cancel-carousel"
                                onClick={() => setShowCouponModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-save-carousel"
                                onClick={handleSaveCoupon}
                            >
                                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal-overlay-new" onClick={() => setShowCategoryModal(false)}>
                    <div className="carousel-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="carousel-modal-header">
                            <h2>{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
                            <button className="close-modal-btn" onClick={() => setShowCategoryModal(false)}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="carousel-modal-body">
                            <div className="form-group-carousel">
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    placeholder="e.g., Rings"
                                    maxLength={50}
                                />
                            </div>

                            <div className="form-group-carousel">
                                <label>Slug (URL-friendly name) *</label>
                                <input
                                    type="text"
                                    value={categoryForm.slug}
                                    onChange={(e) => setCategoryForm({
                                        ...categoryForm,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                                    })}
                                    placeholder="e.g., rings (auto-generated if empty)"
                                    maxLength={50}
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Leave empty to auto-generate from name
                                </small>
                            </div>

                            <div className="form-group-carousel">
                                <label>Display Order</label>
                                <input
                                    type="number"
                                    className='coupon-inputs'
                                    value={categoryForm.displayOrder}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Lower numbers appear first
                                </small>
                            </div>

                            <div className="form-group-carousel">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={categoryForm.showInNavbar}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, showInNavbar: e.target.checked })}
                                        style={{ width: 'auto', margin: 0 }}
                                    />
                                    Show in Navigation Bar
                                </label>
                            </div>

                            <div className="form-group-carousel">
                                <label>Description (Optional)</label>
                                <textarea
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    placeholder="Category description..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="modal-actions-carousel">
                            <button
                                className="btn-cancel-carousel"
                                onClick={() => setShowCategoryModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-save-carousel"
                                onClick={handleSaveCategory}
                            >
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showReviewModal && selectedReview && (
                <div className="modal-overlay-new" onClick={closeReviewModal}>
                    <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-new">
                            <h2>Review Details</h2>
                            <button className="close-modal-btn" onClick={closeReviewModal}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="modal-body-new">
                            <div className="order-info-section">
                                <h3>Customer Information</h3>
                                <p><strong>Name:</strong> {selectedReview.name}</p>
                                <p><strong>Email:</strong> {selectedReview.email}</p>
                                <p><strong>Date:</strong> {new Date(selectedReview.createdAt).toLocaleString()}</p>
                                <p>
                                    <strong>Rating:</strong>{' '}
                                    <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '8px' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} style={{
                                                color: i < selectedReview.rating ? '#d4af37' : '#ddd',
                                                fontSize: '20px'
                                            }}>
                                                ★
                                            </span>
                                        ))}
                                    </span>
                                </p>
                            </div>

                            <div className="order-info-section">
                                <h3>Review Content</h3>
                                <p><strong>Title:</strong></p>
                                <p style={{
                                    fontSize: '18px',
                                    color: '#300708',
                                    fontWeight: '600',
                                    marginBottom: '15px'
                                }}>
                                    {selectedReview.title}
                                </p>
                                <p><strong>Review:</strong></p>
                                <p style={{
                                    lineHeight: '1.6',
                                    color: '#555',
                                    fontStyle: 'italic',
                                    padding: '15px',
                                    background: '#f9f9f9',
                                    borderRadius: '8px'
                                }}>
                                    {selectedReview.review}
                                </p>
                            </div>

                            <div className="order-info-section">
                                <h3>Status</h3>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span className={`status-badge-new ${selectedReview.isApproved ? 'status-confirmed' : 'status-pending'}`}>
                                        {selectedReview.isApproved ? 'Approved' : 'Pending Approval'}
                                    </span>
                                    <span className={`status-badge-new ${selectedReview.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                                        {selectedReview.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                    {selectedReview.verified && (
                                        <span className="status-badge-new status-confirmed">
                                            ✓ Verified Purchase
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                {!selectedReview.isApproved && (
                                    <button
                                        className="btn-modal-confirm"
                                        onClick={() => handleApproveReview(selectedReview._id)}
                                    >
                                        <FiCheck /> Approve Review
                                    </button>
                                )}
                                <button
                                    className="btn-modal-process"
                                    onClick={() => handleToggleReview(selectedReview._id)}
                                >
                                    {selectedReview.isActive ? 'Hide Review' : 'Show Review'}
                                </button>
                                <button
                                    className="btn-modal-cancel"
                                    onClick={() => handleDeleteReview(selectedReview._id)}
                                >
                                    <FiTrash2 /> Delete Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;