import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import Order from '../models/order.js';
import nodemailer from 'nodemailer';

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise (multiply by 100)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      order: razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID // Send key to frontend
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payment/verify
 * @access  Private
 * 
 * CRITICAL: This verifies payment authenticity using cryptographic signature
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId // Our database order ID
    } = req.body;
    
    // Step 1: Verify signature (CRITICAL FOR SECURITY)
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('Invalid payment signature!');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    // Step 2: Fetch payment details from Razorpay to double-check
    let paymentDetails;
    try {
      paymentDetails = await razorpayInstance.payments.fetch(razorpay_payment_id);
    } catch (error) {
      console.error('Failed to fetch payment from Razorpay:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment with Razorpay'
      });
    }

    // Step 3: Verify payment status is 'captured' or 'authorized'
    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      console.error('Payment not completed. Status:', paymentDetails.status);
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentDetails.status}`
      });
    }

    // Step 4: Find order and verify amount matches
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify amount matches (convert rupees to paise)
    const expectedAmount = Math.round(order.totalAmount * 100);
    if (paymentDetails.amount !== expectedAmount) {
      console.error('Amount mismatch!', {
        expected: expectedAmount,
        received: paymentDetails.amount
      });
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch'
      });
    }

    // Step 5: Update order with payment details
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_method: paymentDetails.method,
      payment_date: new Date(),
      amount_paid: paymentDetails.amount / 100 // Convert paise to rupees
    };

    await order.save();
    // Step 6: Send confirmation email (import nodemailer here)
    try {
      await sendOrderConfirmationEmail(order);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the payment verification if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: order
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * @desc    Handle payment failure
 * @route   POST /api/payment/failed
 * @access  Private
 */
export const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, error } = req.body;

    // Find order and mark payment as failed
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      order.paymentInfo = {
        error_description: error?.description || 'Payment failed',
        error_code: error?.code,
        failed_at: new Date()
      };
      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment failure recorded'
    });

  } catch (error) {
    console.error('Handle payment failure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle payment failure'
    });
  }
};

/**
 * Helper function - Send order confirmation email
 */
const sendOrderConfirmationEmail = async (order) => {
  // Import nodemailer at the top of the file

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await order.populate('items.product');

  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.product.itemName}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td>₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: `Order Confirmed - Payment Received #${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2e7d32;">✅ Payment Successful!</h2>
        <p>Dear ${order.customerName},</p>
        <p>Your payment has been successfully received and your order has been confirmed.</p>
        
        <h3>Order Information</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Payment ID:</strong> ${order.paymentInfo.razorpay_payment_id}</p>
        <p><strong>Amount Paid:</strong> ₹${order.totalAmount.toFixed(2)}</p>
        
        <h3>Delivery Address</h3>
        <p>${order.address}</p>
        
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
        
        <p style="margin-top: 30px;">We will notify you once your order is shipped.</p>
        <p>Thank you for shopping with Novara Jewels!</p>
        
        <p style="margin-top: 30px;">Best Regards,<br><strong>Novara Jewels Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};