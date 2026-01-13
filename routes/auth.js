import express from "express";

const router = express.Router();

//import auth controllers
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,

} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";


/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */

router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */

router.post("/login", loginUser);

/**
 * @route   GET /api/auth/profile
 * @desc    Get logged-in user's profile
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);


/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */

router.put('/profile', protect, updateUserProfile);

//export router
export default router;
