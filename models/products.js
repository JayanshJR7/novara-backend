import mongoose, { Schema } from "mongoose";

const ProductSchema = new mongoose.Schema({
    itemname: {
        type: String,
        required: [true, 'Please provide item name.'],
        trim: true
    },

    itemCode: {
        type: String,
        required: [true, 'Please provide item code'],
        unique: true,
        uppercase: true,
        trim: true
    },

    itemImages: {
        type: [String],
        required: [true, 'Please provide at least one item image'],
        validate: {
            validator: function (val) {
                return val.length >= 1 && val.length <= 5;
            },
            message: 'Must have between 1 and 5 images'
        }
    },
    deliveryType: {
        type: String,
        enum: ['ready-to-ship', 'made-to-order'],
        default: 'ready-to-ship',
        required: true
    },

    basePrice: {
        type: Number,
        required: [true, 'Please provide a base price'],
        min: 0,
    },
    finalPrice: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },

    ordersCount: {
        type: Number,
        default: 0,
        min: 0
    },

    wishlistedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    category: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    inStock: {
        type: Boolean,
        trim: true
    },

    description: {
        type: String,
        trim: true,
    },
    
    // ✅ UPDATED WEIGHT STRUCTURE
    weight: {
        silverWeight: {
            type: Number,
            min: 0,
            default: 0,
            description: 'Pure silver content weight'
        },
        netWeight: {
            type: Number,
            min: 0,
            default: 0,
            description: 'Net weight used for pricing (usually same as silverWeight or can be different)'
        },
        grossWeight: {
            type: Number,
            min: 0,
            default: 0,
            description: 'Total weight including all components'
        },
        unit: {
            type: String,
            enum: ['grams', 'kg'],
            default: 'grams'
        }
    },
    
    makingChargeRate: {
        type: Number,
        default: 0,
        min: 0,
        description: 'Making charge per gram (e.g., ₹560/gram)'
    },

}, {
    timestamps: true,
})

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', ProductSchema);
export default Product;