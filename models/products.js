// product schema -- Defines the structure of  jewellery product , stores product details  , pricing and category information
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

    itemImage: {
        type: String,
        required: [true, 'Please provide item image'],
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
    }
}, {
    timestamps: true,
})

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', ProductSchema);
export default Product;




