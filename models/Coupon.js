// const mongoose = require('mongoose');
import mongoose from 'mongoose';
const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number, // Only for percentage discounts
        default: null
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;