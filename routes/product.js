import express from 'express';
const router = express.Router();

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getTrendingProducts,
  searchProducts
} from '../controllers/productController.js';

import { protect, admin } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

router.get('/search', searchProducts);
router.get('/trending', getTrendingProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/', getProducts);

// Dynamic routes (MUST be after static routes)
router.get('/:id', getProductById);

// Protected routes
router.post('/', protect, admin, upload.array('itemImages',5), createProduct);
router.put('/:id', protect, admin, upload.array('itemImages',5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;