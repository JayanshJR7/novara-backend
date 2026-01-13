import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory
} from '../controllers/CategoryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:identifier', getCategoryById);

// Admin routes
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);
router.patch('/:id/toggle', protect, admin, toggleCategory);

export default router;