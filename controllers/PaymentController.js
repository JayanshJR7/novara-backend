import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import Order from '../models/order.js';
import nodemailer from 'nodemailer';
import { sendTelegramMessage } from '../config/telegram.js';

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
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    console.log('🔍 Payment verification request:', {
      orderId,
      razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id?.substring(0, 20) + '...'
    });

    // Validate orderId
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find order and populate user
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      console.error('❌ Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order found:', {
      orderId: order._id,
      userId: order.user?._id,
      isAdmin: order.user?.isAdmin
    });

    const isAdminTestOrder = razorpay_payment_id?.startsWith('test_admin_payment_');
    const isAdmin = order.user && order.user.isAdmin === true;

    console.log('🔍 Admin check:', {
      isAdminTestOrder,
      isAdmin,
      userExists: !!order.user,
      paymentId: razorpay_payment_id
    });

    if (isAdminTestOrder && isAdmin) {
      console.log('🔧 ============================================');
      console.log('🔧 ADMIN TEST ORDER DETECTED');
      console.log('🔧 Skipping ALL Razorpay validation');
      console.log('🔧 ============================================');
      console.log(`   Admin user: ${order.user.email}`);
      console.log(`   Test payment ID: ${razorpay_payment_id}`);

      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      order.paymentInfo = {
        razorpay_order_id: razorpay_order_id || 'test_admin_order_' + Date.now(),
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature || 'test_admin_signature',
        payment_method: 'TEST MODE (ADMIN)',
        payment_date: new Date(),
        amount_paid: order.totalAmount
      };

      await order.save();

      // Populate items for email
      await order.populate('items.product');

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(order);
        console.log('✅ Admin test order confirmation email sent');
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
      }

      // Send Telegram notification
      try {
        const itemsList = order.items.map((item, idx) =>
          `${idx + 1}. ${item.product.itemname} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');

        const telegramMessage = `
⚠️ <b>TEST MODE - ADMIN ORDER CREATED</b> ⚠️

📦 <b>Order ID:</b> ${order._id}
👤 <b>Customer:</b> ${order.customerName} (ADMIN)
📧 <b>Email:</b> ${order.email}
📱 <b>Phone:</b> ${order.phone}

<b>Items:</b>
${itemsList}

💰 <b>Subtotal:</b> ₹${order.subtotal.toFixed(2)}
${order.discount > 0 ? `🎟️ <b>Discount:</b> -₹${order.discount.toFixed(2)} ${order.couponCode ? `(${order.couponCode})` : ''}` : ''}
🚚 <b>Delivery:</b> ${order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toFixed(2)}` : 'FREE'}
💳 <b>Total:</b> ₹${order.totalAmount.toFixed(2)}

💳 <b>Payment ID:</b> ${order.paymentInfo.razorpay_payment_id}
💳 <b>Method:</b> TEST MODE (ADMIN)
✅ <b>Status:</b> CONFIRMED

📍 <b>Shipping Address:</b>
${order.shippingAddress?.address || 'N/A'}
${order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ''}${order.shippingAddress?.state || ''}
${order.shippingAddress?.zipCode || ''}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

⚠️ <b>THIS IS A TEST ORDER - NO REAL PAYMENT PROCESSED</b>
        `.trim();

        await sendTelegramMessage(telegramMessage);
        console.log('✅ Admin test order Telegram notification sent');
      } catch (telegramError) {
        console.error('❌ Telegram notification failed:', telegramError);
      }

      console.log('🔧 ============================================');
      console.log('🔧 ADMIN TEST ORDER COMPLETED SUCCESSFULLY');
      console.log('🔧 ============================================');

      return res.json({
        success: true,
        message: 'Admin test order verified successfully (No payment required)',
        order: order,
        testMode: true,
        adminTest: true
      });
    }

    console.log('💳 ============================================');
    console.log('💳 NORMAL PAYMENT VERIFICATION STARTED');
    console.log('💳 ============================================');

    // Validate required fields (only for non-admin orders)
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('❌ Invalid payment signature!');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    console.log('✅ Payment signature verified');

    let paymentDetails;
    try {
      paymentDetails = await razorpayInstance.payments.fetch(razorpay_payment_id);
      console.log('✅ Payment details fetched from Razorpay');
    } catch (error) {
      console.error('❌ Failed to fetch payment from Razorpay:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment with Razorpay'
      });
    }

    // Step 3: Verify payment status
    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      console.error('❌ Payment not completed. Status:', paymentDetails.status);
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentDetails.status}`
      });
    }

    console.log('✅ Payment status verified:', paymentDetails.status);

    // Step 4: Verify amount
    const expectedAmount = Math.round(order.totalAmount * 100);
    if (paymentDetails.amount !== expectedAmount) {
      console.error('❌ Amount mismatch!', {
        expected: expectedAmount,
        received: paymentDetails.amount
      });
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch'
      });
    }

    console.log('✅ Payment amount verified');

    // Step 5: Update order
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_method: paymentDetails.method,
      payment_date: new Date(),
      amount_paid: paymentDetails.amount / 100
    };

    await order.save();
    await order.populate('items.product');

    console.log('✅ Order updated with payment info');

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(order);
      console.log('✅ Order confirmation email sent');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
    }

    // Send Telegram notification
    try {
      const itemsList = order.items.map((item, idx) =>
        `${idx + 1}. ${item.product.itemname} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');

      const telegramMessage = `
✅ <b>PAYMENT SUCCESSFUL</b> ✅

📦 <b>Order ID:</b> ${order._id}
👤 <b>Customer:</b> ${order.customerName}
📧 <b>Email:</b> ${order.email}
📱 <b>Phone:</b> ${order.phone}

<b>Items:</b>
${itemsList}

💰 <b>Subtotal:</b> ₹${order.subtotal.toFixed(2)}
${order.discount > 0 ? `🎟️ <b>Discount:</b> -₹${order.discount.toFixed(2)} ${order.couponCode ? `(${order.couponCode})` : ''}` : ''}
🚚 <b>Delivery:</b> ${order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toFixed(2)}` : 'FREE'}
💳 <b>Total Paid:</b> ₹${order.totalAmount.toFixed(2)}

💳 <b>Payment ID:</b> ${razorpay_payment_id}
💳 <b>Method:</b> ${paymentDetails.method?.toUpperCase() || 'N/A'}
✅ <b>Status:</b> CONFIRMED

📍 <b>Shipping Address:</b>
${order.shippingAddress?.address || 'N/A'}
${order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ''}${order.shippingAddress?.state || ''}
${order.shippingAddress?.zipCode || ''}

⏰ <b>Paid at:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

🎉 <b>Action Required:</b> Process and ship this order!
      `.trim();

      await sendTelegramMessage(telegramMessage);
      console.log('✅ Payment successful Telegram notification sent');
    } catch (telegramError) {
      console.error('❌ Telegram notification failed:', telegramError);
    }

    console.log('💳 ============================================');
    console.log('💳 PAYMENT VERIFICATION COMPLETED');
    console.log('💳 ============================================');

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: order
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
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

    console.log('❌ Payment failure for order:', orderId);

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

    try {
      const telegramMessage = `
❌ <b>PAYMENT FAILED</b> ❌

📦 <b>Order ID:</b> ${order._id}
👤 <b>Customer:</b> ${order.customerName}
📧 <b>Email:</b> ${order.email}

💰 <b>Amount:</b> ₹${order.totalAmount.toFixed(2)}
❌ <b>Error:</b> ${error?.description || 'Payment failed'}
🔴 <b>Error Code:</b> ${error?.code || 'N/A'}

⏰ <b>Failed at:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      `.trim();

      await sendTelegramMessage(telegramMessage);
      console.log('✅ Payment failure Telegram notification sent');
    } catch (telegramError) {
      console.error('❌ Telegram notification failed:', telegramError);
    }

    res.json({
      success: true,
      message: 'Payment failure recorded'
    });

  } catch (error) {
    console.error('❌ Handle payment failure error:', error);
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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Ensure items are populated
  if (!order.populated('items.product')) {
    await order.populate('items.product');
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.product.itemname}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td>₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const isTestOrder = order.paymentInfo?.payment_method === 'TEST MODE (ADMIN)';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: `${isTestOrder ? '[TEST] ' : ''}Order Confirmed - Payment Received #${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${isTestOrder ? `
        <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #856404;">🔧 TEST ORDER</h3>
          <p style="margin: 0; color: #856404; font-size: 14px;">
            This is a test order created in admin mode. No actual payment was processed.
          </p>
        </div>
        ` : ''}
        
        <h2 style="color: #2e7d32;">✅ Payment Successful!</h2>
        <p>Dear ${order.customerName},</p>
        <p>Your ${isTestOrder ? 'test ' : ''}payment has been successfully ${isTestOrder ? 'simulated and your test ' : 'received and your '}order has been confirmed.</p>
        
        <h3>Order Information</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Payment ID:</strong> ${order.paymentInfo.razorpay_payment_id}</p>
        <p><strong>Amount Paid:</strong> ₹${order.totalAmount.toFixed(2)}</p>
        ${isTestOrder ? '<p><strong>Payment Mode:</strong> TEST MODE (ADMIN)</p>' : ''}
        
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
        
        <p style="margin-top: 30px;">We will notify you once your order is shipped.</p>
        <p>Thank you for shopping with Novara Jewels!</p>
        
        <p style="margin-top: 30px;">Best Regards,<br><strong>Novara Jewels Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};