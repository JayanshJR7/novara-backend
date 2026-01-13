import Order from '../models/order.js';
import Product from '../models/products.js';
import nodemailer from 'nodemailer';
import Coupon from '../models/Coupon.js';

/**
 * Email transporter configuration
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      shippingAddress,
      items,
      paymentMethod,
      additionalCharges,
      couponCode,
      discount,
      deliveryCharge
    } = req.body;

    // Validate required fields
    if (!customerName || !email || !phone || !shippingAddress || !items || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one item'
      });
    }
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      if (!product.inStock) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.itemname} is out of stock`
        });
      }

      const itemPrice = product.finalPrice;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice
      });

      subtotal += itemPrice * item.quantity;
    }

    let finalDiscount = 0;
    let couponDetails = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (coupon) {
        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({
            success: false,
            message: 'Coupon usage limit reached'
          });
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          return res.status(400).json({
            success: false,
            message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
          });
        }

        // Calculate discount
        if (coupon.discountType === 'percentage') {
          finalDiscount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount) {
            finalDiscount = Math.min(finalDiscount, coupon.maxDiscount);
          }
        } else {
          finalDiscount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed subtotal
        finalDiscount = Math.min(finalDiscount, subtotal);

        couponDetails = {
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          appliedOn: new Date()
        };

        // Increment coupon usage count
        coupon.usedCount += 1;
        await coupon.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired coupon code'
        });
      }
    }

    // Calculate additional charges total
    let additionalTotal = 0;
    if (additionalCharges && Array.isArray(additionalCharges)) {
      additionalTotal = additionalCharges.reduce((total, charge) => {
        return total + (charge.chargeAmount || 0);
      }, 0);
    }

    // Calculate final total with discount
    const totalAmount = subtotal - finalDiscount + (deliveryCharge || 0) + additionalTotal;

    // Create order with PENDING payment status
    const order = await Order.create({
      user: req.user ? req.user._id : null,
      customerName,
      email,
      phone,
      shippingAddress,
      items: orderItems,
      additionalCharges: additionalCharges || [],
      subtotal,
      discount: finalDiscount,
      couponCode: couponCode ? couponCode.toUpperCase() : null,
      couponDetails,
      deliveryCharge: deliveryCharge || 0,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    await order.populate('items.product');

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Please complete payment.',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    // Fetch all orders with populated product details
    const orders = await Order.find()
      .populate('items.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export const getUserOrders = async (req, res) => {
  try {
    // Fetch orders for logged-in user
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    // Find order by ID with populated details
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (req.user && !req.user.isAdmin && order.user && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update order (Add charges, change status)
 * @route   PUT /api/orders/:id
 * @access  Private/Admin
 */
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update order status if provided
    if (req.body.orderStatus) {
      order.orderStatus = req.body.orderStatus;
    }

    // Update payment status if provided
    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    // Add or update additional charges
    if (req.body.additionalCharges) {
      order.additionalCharges = req.body.additionalCharges;

      // ✅ UPDATE THIS - Recalculate with deliveryCharge and discount
      const additionalTotal = order.additionalCharges.reduce((total, charge) => {
        return total + charge.chargeAmount;
      }, 0);

      order.totalAmount = order.subtotal - (order.discount || 0) + (order.deliveryCharge || 0) + additionalTotal;
    }

    // Update tracking number if provided
    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    // Update notes if provided
    if (req.body.notes) {
      order.notes = req.body.notes;
    }

    // Save updated order
    const updatedOrder = await order.save();
    await updatedOrder.populate('items.product');

    // Send email notification if order status changed
    if (req.body.orderStatus) {
      try {
        await sendOrderStatusEmail(updatedOrder);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete order
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.deleteOne();

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper function - Send order confirmation email
 */
const sendOrderConfirmationEmail = async (order) => {
  // Generate items list HTML
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.product.itemname}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td>₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  let chargesHtml = '';
  if (order.additionalCharges && order.additionalCharges.length > 0) {
    chargesHtml = order.additionalCharges.map(charge => `
      <tr>
        <td colspan="3" style="text-align: right;">${charge.chargeName}:</td>
        <td>₹${charge.chargeAmount.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: `Order Confirmation - Novara Jewels #${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank You for Your Order!</h2>
        <p>Dear ${order.customerName},</p>
        <p>Your order has been successfully placed. Here are the details:</p>
        
        <h3>Order Information</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
        
        <h3>Delivery Address</h3>
        <p>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
          ${order.shippingAddress.country} - ${order.shippingAddress.zipCode}
        </p>
        <h3>Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="padding: 10px; border: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <table style="width: 100%; margin-top: 20px;">
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
            <td><strong>₹${order.subtotal.toFixed(2)}</strong></td>
          </tr>
          
          ${order.discount > 0 ? `
          <tr>
            <td colspan="3" style="text-align: right;">Discount ${order.couponCode ? `(${order.couponCode})` : ''}:</td>
            <td style="color: green;">-₹${order.discount.toFixed(2)}</td>
          </tr>
          ` : ''}
          
          ${order.deliveryCharge > 0 ? `
          <tr>
            <td colspan="3" style="text-align: right;">Delivery Charge:</td>
            <td>₹${order.deliveryCharge.toFixed(2)}</td>
          </tr>
          ` : `
          <tr>
            <td colspan="3" style="text-align: right;">Delivery Charge:</td>
            <td style="color: green;"><strong>FREE</strong></td>
          </tr>
          `}
          
          ${chargesHtml}
          
          <tr style="background-color: #f4f4f4;">
            <td colspan="3" style="text-align: right; padding: 10px;"><strong>Total Amount:</strong></td>
            <td style="padding: 10px;"><strong>₹${order.totalAmount.toFixed(2)}</strong></td>
          </tr>
        </table>
        
        <p style="margin-top: 30px;">We will notify you once your order is shipped.</p>
        <p>For any queries, contact us at ${process.env.EMAIL_USER}</p>
        
        <p style="margin-top: 30px;">Best Regards,<br><strong>Novara Jewels Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Helper function - Send order status update email
 */
const sendOrderStatusEmail = async (order) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being processed.',
    processing: 'Your order is currently being prepared for shipment.',
    shipped: `Your order has been shipped. Tracking Number: ${order.trackingNumber || 'N/A'}`,
    delivered: 'Your order has been successfully delivered. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled. If you have any questions, please contact us.'
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: `Order Update - Novara Jewels #${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Status Update</h2>
        <p>Dear ${order.customerName},</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Status:</strong> ${order.orderStatus.toUpperCase()}</p>
        <p>${statusMessages[order.orderStatus]}</p>
        ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
        <p style="margin-top: 30px;">Best Regards,<br><strong>Novara Jewels Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};