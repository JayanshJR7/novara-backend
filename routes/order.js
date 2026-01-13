//import express and create router
import express from 'express';
const router = express.Router();

//import order controllers
import {
    createOrder,
    getAllOrders,
    getUserOrders,
    getOrderById,
    updateOrder,
    deleteOrder
} from '../controllers/orderController.js';

//import middleware
import { protect, admin } from '../middleware/auth.js';

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private (or Public for guest checkout)
 */
router.post('/', protect, createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, admin, getAllOrders);

/**
 * @route   GET /api/orders/myorders
 * @desc    Get logged-in user's orders
 * @access  Private
 */
router.get('/myorders', protect, getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:id', protect, getOrderById);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order (add charges, change status)
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, updateOrder);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteOrder);

// Export router
export default router;