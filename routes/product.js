import express from 'express';
const router = express.Router();

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getTrendingProducts
} from '../controllers/productController.js';

import { protect, admin } from '../middleware/auth.js';

import { upload } from '../config/cloudinary.js';

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/category/:category
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:category', getProductsByCategory);

router.get('/trending', getTrendingProducts);


/**
 * @route   POST /api/products
 * @desc    Create new product (with image upload)
 * @access  Private/Admin
 */
router.post('/', protect, admin, upload.single('itemImage'), createProduct);


/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (with optional new Cloudinary image upload)
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, upload.single('itemImage'), updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (also deletes image from Cloudinary)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteProduct);

export default router;
    