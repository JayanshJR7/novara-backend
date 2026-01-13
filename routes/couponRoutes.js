import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all coupons (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ coupons });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch coupons' });
    }
});

// Get active coupons (Public - for validation)
router.get('/active', async (req, res) => {
    try {
        const coupons = await Coupon.find({ 
            isActive: true,
            expiresAt: { $gt: new Date() }
        });
        res.json({ coupons });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch active coupons' });
    }
});

// Validate coupon code
router.post('/validate', async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon code' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({ 
                message: `Minimum order amount of ₹${coupon.minOrderAmount} required` 
            });
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else {
            discount = coupon.discountValue;
        }

        res.json({
            valid: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discount: discount
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to validate coupon' });
    }
});

// Create coupon (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscount,
            expiresAt,
            usageLimit,
            description
        } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscount,
            expiresAt,
            usageLimit,
            description
        });

        await coupon.save();
        res.status(201).json({ message: 'Coupon created successfully', coupon });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create coupon' });
    }
});

// Update coupon (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        Object.assign(coupon, req.body);
        await coupon.save();

        res.json({ message: 'Coupon updated successfully', coupon });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update coupon' });
    }
});

// Toggle coupon active status (Admin only)
router.patch('/:id/toggle', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({ 
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`, 
            coupon 
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle coupon status' });
    }
});

// Delete coupon (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await coupon.deleteOne();
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete coupon' });
    }
});

// Increment coupon usage (called when order is placed)
router.post('/:id/use', async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        coupon.usedCount += 1;
        await coupon.save();

        res.json({ message: 'Coupon usage recorded' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to record coupon usage' });
    }
});

export default router;