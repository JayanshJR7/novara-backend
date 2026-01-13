import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Products API
export const productsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },
  getTrending: async () => {
    const response = await api.get('/products/trending');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  createProduct: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  updateProduct: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Cart & Wishlist API
export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/users/cart');
    return response.data;
  },
  addToCart: async (productId, quantity) => {
    const response = await api.post('/users/cart', { productId, quantity });
    return response.data;
  },
  updateCartItem: async (productId, quantity) => {
    const response = await api.put(`/users/cart/${productId}`, { quantity });
    return response.data;
  },
  removeFromCart: async (productId) => {
    const response = await api.delete(`/users/cart/${productId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/users/cart');
    return response.data;
  },
  getWishlist: async () => {
    const response = await api.get('/users/wishlist');
    return response.data;
  },
  addToWishlist: async (productId) => {
    const response = await api.post(`/users/wishlist/${productId}`);
    return response.data;
  },
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/users/wishlist/${productId}`);
    return response.data;
  }
};

// ORDERS API
export const ordersAPI = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getUserOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  updateOrder: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  }
};

// PAYMENT API
export const paymentAPI = {
  createOrder: async (amount, orderId) => {
    const response = await api.post('/payment/create-order', {
      amount,
      currency: 'INR',
      receipt: `order_${orderId}`
    });
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await api.post('/payment/verify', paymentData);
    return response.data;
  },

  handleFailure: async (orderId, error) => {
    const response = await api.post('/payment/failed', { orderId, error });
    return response.data;
  }
};

// COUPONS API
export const couponsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/coupons');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching coupons:', error.response?.data || error.message);
      throw error;
    }
  },

  getActive: async () => {
    try {
      const response = await api.get('/coupons/active');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching active coupons:', error.response?.data || error.message);
      throw error;
    }
  },

  validate: async (code, orderAmount) => {
    try {
      const response = await api.post('/coupons/validate', { code, orderAmount });
      return response.data;
    } catch (error) {
      console.error('❌ Coupon validation error:', error.response?.data || error.message);
      throw error;
    }
  },

  create: async (couponData) => {
    try {
      const response = await api.post('/coupons', couponData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating coupon:', error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, couponData) => {
    try {
      const response = await api.put(`/coupons/${id}`, couponData);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating coupon:', error.response?.data || error.message);
      throw error;
    }
  },

  toggle: async (id) => {
    try {
      const response = await api.patch(`/coupons/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('❌ Error toggling coupon:', error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting coupon:', error.response?.data || error.message);
      throw error;
    }
  },

  use: async (id) => {
    try {
      const response = await api.post(`/coupons/${id}/use`);
      return response.data;
    } catch (error) {
      console.error('❌ Error recording coupon usage:', error.response?.data || error.message);
      throw error;
    }
  }
};

export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/categories?isActive=true');
    return response.data;
  },

  getNavbarCategories: async () => {
    const response = await api.get('/categories?showInNavbar=true&isActive=true');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  toggle: async (id) => {
    const response = await api.patch(`/categories/${id}/toggle`);
    return response.data;
  }
};

export const reviewsAPI = {
  // Get all approved reviews (public)
  getAll: async () => {
    try {
        const response = await api.get('/reviews');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching reviews:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all reviews including unapproved (admin only)
  getAllAdmin: async () => {
    try {
      const response = await api.get('/reviews/all');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all reviews:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get review statistics
  getStats: async () => {
    try {
      const response = await api.get('/reviews/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching review stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create a new review
  create: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating review:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update a review (admin only)
  update: async (id, reviewData) => {
    try {
      const response = await api.put(`/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating review:', error.response?.data || error.message);
      throw error;
    }
  },

  // Approve a review (admin only)
  approve: async (id) => {
    try {
      const response = await api.patch(`/reviews/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('❌ Error approving review:', error.response?.data || error.message);
      throw error;
    }
  },

  // Toggle review active status (admin only)
  toggle: async (id) => {
    try {
      const response = await api.patch(`/reviews/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('❌ Error toggling review:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a review (admin only)
  delete: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting review:', error.response?.data || error.message);
      throw error;
    }
  }
};

export const carouselAPI = {
  getAll: async () => {
    const res = await api.get('/carousel/slides');
    return res.data;
  },

  create: async (formData) => {
    const res = await api.post('/carousel/slides', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  update: async (id, formData) => {
    const res = await api.put(`/carousel/slides/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/carousel/slides/${id}`);
    return res.data;
  }
};


export default api;