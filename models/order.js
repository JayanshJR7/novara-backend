import mongoose from "mongoose";

/**
 * Order Schema - Defines the structure of customer orders
 * Stores order details, items, charges, and payment information
*/

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    //customer's full name
    customerName: {
        type: String,
        required: [true, 'Please provide Customer name.'],
        trim: true,
    },

    //customer's email for order confirmation
    email: {
        type: String,
        required: [true, 'Please provide email'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    //customer's phone number for delivery coordination
    phone: {
        type: String,
        required: [true, 'Please provide the phone number'],
        trim: true
    },

    // UPDATED: Structured shipping address
    shippingAddress: {
        address: {
            type: String,
            required: [true, 'Please provide street address'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'Please provide city'],
            trim: true,
        },
        state: {
            type: String,
            required: [true, 'Please provide state'],
            trim: true,
        },
        country: {
            type: String,
            required: [true, 'Please provide country'],
            trim: true,
        },
        zipCode: {
            type: String,
            required: [true, 'Please provide ZIP code'],
            trim: true,
        }
    },

    // Array of ordered items with product details
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        price: {
            type: Number,
            required: true,
        }
    }],

    //Additional charges added by admin (delivery, packing, etc)
    additionalCharges: [{
        chargeName: {
            type: String,
            required: true,
            trim: true,
        },

        chargeAmount: {
            type: Number,
            required: true,
            min: 0,
        }
    }],

    deliveryCharge: {
        type: Number,
        default: 0,
        required: true
    },
    
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    
    couponCode: {
        type: String,
        uppercase: true,
        trim: true,
        default: null
    },

    discount: {
        type: Number,
        default: 0,
        min: 0
    },

    couponDetails: {
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
        },
        discountValue: Number,
        appliedOn: Date
    },

    paymentMethod: {
        type: String,
        enum: ['cod', 'upi', 'card', 'netbanking', 'wallet', 'razorpay'],
        required: [true, 'Please select payment method']
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },

    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },

    paymentInfo: {
        razorpay_order_id: String,
        razorpay_payment_id: String,
        razorpay_signature: String,
        payment_method: String,
        payment_date: Date,
        amount_paid: Number,
        error_description: String,
        error_code: String,
        failed_at: Date
    },

    //Tracking information (optional)
    trackingNumber: {
        type: String,
        trim: true,
    },

    //Admin Notes
    notes: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true,
});


/**
 * Pre-save middleware - Calculates subtotal if not provided
 */
OrderSchema.pre('save', function (next) {
    // Calculate subtotal from items if not already set
    if (!this.subtotal) {
        this.subtotal = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Calculate total amount if not already set
    if (!this.totalAmount) {
        const additionalTotal = this.additionalCharges.reduce((total, charge) => {
            return total + charge.chargeAmount;
        }, 0);

        // Apply discount to subtotal before adding additional charges
        const discountedSubtotal = this.subtotal - (this.discount || 0);
        this.totalAmount = Math.max(0, discountedSubtotal + additionalTotal);
    }

    next();
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;