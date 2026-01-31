import TelegramBot from 'node-telegram-bot-api';
import Order from '../models/order.js';
import Product from '../models/products.js';
import User from '../models/user.js';
import Coupon from '../models/Coupon.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// ============================================
// 📊 REVENUE & ORDER ANALYTICS
// ============================================

bot.on('message', (msg) => {
  console.log('📍 Chat ID:', msg.chat.id);
  console.log('📍 Chat Type:', msg.chat.type);
  console.log('📍 Chat Title:', msg.chat.title);
});

const getTodayRevenue = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await Order.find({
    createdAt: { $gte: today },
    paymentStatus: 'completed'
  });

  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrder = orders.length > 0 ? revenue / orders.length : 0;

  return {
    revenue: revenue.toFixed(2),
    orderCount: orders.length,
    avgOrderValue: avgOrder.toFixed(2)
  };
};

const getWeekRevenue = async () => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const orders = await Order.find({
    createdAt: { $gte: weekStart },
    paymentStatus: 'completed'
  });

  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    revenue: revenue.toFixed(2),
    orderCount: orders.length
  };
};

const getMonthRevenue = async () => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const orders = await Order.find({
    createdAt: { $gte: monthStart },
    paymentStatus: 'completed'
  });

  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    revenue: revenue.toFixed(2),
    orderCount: orders.length
  };
};

const getTopProducts = async (days = 7) => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const orders = await Order.find({
    createdAt: { $gte: dateFrom },
    paymentStatus: 'completed'
  }).populate('items.product');

  const productSales = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const productName = item.product?.itemname || 'Unknown';
      if (!productSales[productName]) {
        productSales[productName] = 0;
      }
      productSales[productName] += item.quantity;
    });
  });

  const sorted = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sorted.map(([name, count]) => ({ name, count }));
};

const getOrderStatus = async () => {
  const pending = await Order.countDocuments({ orderStatus: 'pending' });
  const confirmed = await Order.countDocuments({ orderStatus: 'confirmed' });
  const processing = await Order.countDocuments({ orderStatus: 'processing' });
  const shipped = await Order.countDocuments({ orderStatus: 'shipped' });
  const delivered = await Order.countDocuments({ orderStatus: 'delivered' });
  const cancelled = await Order.countDocuments({ orderStatus: 'cancelled' });

  return { pending, confirmed, processing, shipped, delivered, cancelled };
};

const compareMonths = async () => {
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const thisMonthOrders = await Order.find({
    createdAt: { $gte: thisMonth },
    paymentStatus: 'completed'
  });

  const lastMonthOrders = await Order.find({
    createdAt: { $gte: lastMonth, $lt: thisMonth },
    paymentStatus: 'completed'
  });

  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const growth = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : 0;

  return {
    thisMonth: {
      orders: thisMonthOrders.length,
      revenue: thisMonthRevenue.toFixed(2)
    },
    lastMonth: {
      orders: lastMonthOrders.length,
      revenue: lastMonthRevenue.toFixed(2)
    },
    growth: growth
  };
};

// ============================================
// 🛍️ PRODUCT ANALYTICS
// ============================================

const getMostViewedProducts = async () => {
  const products = await Product.find()
    .sort({ views: -1 })
    .limit(5);
  
  return products.map(p => ({
    name: p.itemname,
    views: p.views,
    orders: p.ordersCount
  }));
};

const getMostWishlisted = async () => {
  const products = await Product.find()
    .sort({ wishlistedCount: -1 })
    .limit(5);
  
  return products.map(p => ({
    name: p.itemname,
    wishlisted: p.wishlistedCount,
    inStock: p.inStock
  }));
};

const getConversionRate = async () => {
  const products = await Product.find({ views: { $gt: 0 } });
  
  const withConversion = products.map(p => ({
    name: p.itemname,
    views: p.views,
    orders: p.ordersCount,
    conversionRate: ((p.ordersCount / p.views) * 100).toFixed(2)
  })).sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate));
  
  return withConversion.slice(0, 5);
};

const getDeadStock = async () => {
  const deadProducts = await Product.find({
    views: { $gte: 50 },
    ordersCount: 0,
    inStock: true
  }).sort({ views: -1 });
  
  return deadProducts.map(p => ({
    name: p.itemname,
    views: p.views,
    price: p.finalPrice,
    wishlisted: p.wishlistedCount
  }));
};

const getCategoryStats = async () => {
  const categories = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        totalOrders: { $sum: '$ordersCount' },
        totalRevenue: { $sum: { $multiply: ['$finalPrice', '$ordersCount'] } },
        avgPrice: { $avg: '$finalPrice' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
  
  return categories.map(c => ({
    category: c._id,
    products: c.productCount,
    orders: c.totalOrders,
    revenue: c.totalRevenue.toFixed(2),
    avgPrice: c.avgPrice.toFixed(2)
  }));
};

const getPriceAnalysis = async () => {
  const products = await Product.find({ inStock: true });
  
  const avgPrice = products.reduce((sum, p) => sum + p.finalPrice, 0) / products.length;
  const maxPrice = Math.max(...products.map(p => p.finalPrice));
  const minPrice = Math.min(...products.map(p => p.finalPrice));
  
  const discounted = products
    .map(p => ({
      name: p.itemname,
      basePrice: p.basePrice,
      finalPrice: p.finalPrice,
      discount: p.basePrice - p.finalPrice,
      discountPercent: ((p.basePrice - p.finalPrice) / p.basePrice * 100).toFixed(1)
    }))
    .filter(p => p.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 5);
  
  return { avgPrice: avgPrice.toFixed(2), maxPrice, minPrice, discounted };
};

const getSilverInventory = async () => {
  const products = await Product.find({ inStock: true });
  
  const totalSilver = products.reduce((sum, p) => {
    return sum + (p.weight?.silverWeight || 0);
  }, 0);
  
  const totalGross = products.reduce((sum, p) => {
    return sum + (p.weight?.grossWeight || 0);
  }, 0);
  
  return {
    totalSilver: totalSilver.toFixed(2),
    totalGross: totalGross.toFixed(2),
    productCount: products.length
  };
};

const getDeliveryStats = async () => {
  const readyToShip = await Product.countDocuments({ 
    deliveryType: 'ready-to-ship',
    inStock: true 
  });
  
  const madeToOrder = await Product.countDocuments({ 
    deliveryType: 'made-to-order' 
  });
  
  return { readyToShip, madeToOrder };
};

// ============================================
// 📦 STOCK MANAGEMENT
// ============================================

const getLowStock = async (threshold = 5) => {
  const products = await Product.find({
    stockQuantity: { $lte: threshold, $gt: 0 }
  });

  return products.map(p => ({
    name: p.itemname,
    stock: p.stockQuantity
  }));
};

const getOutOfStock = async () => {
  const products = await Product.find({ inStock: false });
  return products.map(p => ({ name: p.itemname, wishlisted: p.wishlistedCount }));
};

// ============================================
// 👥 CUSTOMER ANALYTICS
// ============================================

const getNewCustomers = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await User.find({
    createdAt: { $gte: today }
  });

  return users.map(u => ({
    name: u.name,
    email: u.email
  }));
};

const getVIPCustomers = async (minOrders = 3) => {
  const customers = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    {
      $group: {
        _id: '$user',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' }
      }
    },
    { $match: { orderCount: { $gte: minOrders } } },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
  ]);

  const populated = await User.populate(customers, { path: '_id', select: 'name email' });

  return populated.map(c => ({
    name: c._id?.name || 'Unknown',
    orders: c.orderCount,
    spent: c.totalSpent.toFixed(2)
  }));
};

// ============================================
// 🎟️ COUPON ANALYTICS
// ============================================

const getCouponStats = async () => {
  const coupons = await Coupon.find({ isActive: true });

  const stats = await Promise.all(coupons.map(async (coupon) => {
    const orders = await Order.find({
      couponCode: coupon.code,
      paymentStatus: 'completed'
    });

    const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);

    return {
      code: coupon.code,
      usageCount: coupon.usageCount || orders.length,
      totalDiscount: totalDiscount.toFixed(2)
    };
  }));

  return stats.sort((a, b) => b.usageCount - a.usageCount);
};

// ============================================
// 🤖 BOT COMMANDS
// ============================================

bot.onText(/^(maya|Maya|MAYA|hey maya|Hey Maya)[\s,]?\s*(.+)?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[2]?.toLowerCase().trim();

  if (!query) {
    bot.sendMessage(chatId, 
      '👋 Hi! I\'m Maya, your business assistant!\n\n' +
      '<b>💰 Revenue:</b> revenue today/week/month, compare months\n' +
      '<b>📦 Orders:</b> pending orders, order status\n' +
      '<b>🛍️ Products:</b> top products, most viewed, most wishlisted, conversion rate, dead stock, category performance\n' +
      '<b>📊 Analysis:</b> price analysis, silver inventory, delivery stats\n' +
      '<b>📦 Stock:</b> low stock, out of stock\n' +
      '<b>👥 Customers:</b> new customers, VIP customers\n' +
      '<b>🎟️ Coupons:</b> coupon stats',
      { parse_mode: 'HTML' }
    );
    return;
  }

  try {
    // ========== REVENUE QUERIES ==========
    if (query.includes('revenue') || query.includes('sales')) {
      if (query.includes('today')) {
        const data = await getTodayRevenue();
        bot.sendMessage(chatId, `📊 <b>Today's Revenue</b>\n\n💰 Revenue: ₹${data.revenue}\n📦 Orders: ${data.orderCount}\n📈 Avg Order: ₹${data.avgOrderValue}`, { parse_mode: 'HTML' });
      } else if (query.includes('week')) {
        const data = await getWeekRevenue();
        bot.sendMessage(chatId, `📊 <b>This Week's Revenue</b>\n\n💰 Revenue: ₹${data.revenue}\n📦 Orders: ${data.orderCount}`, { parse_mode: 'HTML' });
      } else if (query.includes('month')) {
        const data = await getMonthRevenue();
        bot.sendMessage(chatId, `📊 <b>This Month's Revenue</b>\n\n💰 Revenue: ₹${data.revenue}\n📦 Orders: ${data.orderCount}`, { parse_mode: 'HTML' });
      } else {
        const data = await getTodayRevenue();
        bot.sendMessage(chatId, `📊 <b>Today's Revenue</b>\n\n💰 Revenue: ₹${data.revenue}\n📦 Orders: ${data.orderCount}`, { parse_mode: 'HTML' });
      }
    }

    // ========== PRODUCT ANALYTICS ==========
    else if (query.includes('top') && (query.includes('product') || query.includes('selling'))) {
      const products = await getTopProducts();
      const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.count} sales`).join('\n');
      bot.sendMessage(chatId, `🏆 <b>Top Products (Last 7 Days)</b>\n\n${list}`, { parse_mode: 'HTML' });
    }

    else if (query.includes('most viewed') || query.includes('popular')) {
      const products = await getMostViewedProducts();
      const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.views} views (${p.orders} orders)`).join('\n');
      bot.sendMessage(chatId, `🔥 <b>Most Viewed Products</b>\n\n${list}`, { parse_mode: 'HTML' });
    }

    else if (query.includes('most wishlisted') || query.includes('wishlist')) {
      const products = await getMostWishlisted();
      const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.wishlisted} wishlists ${p.inStock ? '✅' : '❌ Out of Stock'}`).join('\n');
      bot.sendMessage(chatId, `❤️ <b>Most Wishlisted Products</b>\n\n${list}`, { parse_mode: 'HTML' });
    }

    else if (query.includes('conversion')) {
      const products = await getConversionRate();
      const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.conversionRate}% (${p.views} views → ${p.orders} orders)`).join('\n');
      bot.sendMessage(chatId, `📊 <b>Top Converting Products</b>\n\n${list}\n\n💡 Good conversion rate is 2-5%`, { parse_mode: 'HTML' });
    }

    else if (query.includes('dead stock')) {
      const products = await getDeadStock();
      if (products.length === 0) {
        bot.sendMessage(chatId, '✅ No dead stock! All viewed products have sales.');
      } else {
        const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.views} views, ₹${p.price} (${p.wishlisted} wishlists)`).join('\n');
        bot.sendMessage(chatId, `⚠️ <b>Products with Views but NO Sales</b>\n\n${list}\n\n💡 <b>Action Needed:</b>\n• Reduce price\n• Improve photos\n• Add to flash sale`, { parse_mode: 'HTML' });
      }
    }

    else if (query.includes('category') && query.includes('performance')) {
      const categories = await getCategoryStats();
      const list = categories.map((c, i) => 
        `${i + 1}. <b>${c.category.toUpperCase()}</b>\n` +
        `   Products: ${c.products} | Orders: ${c.orders}\n` +
        `   Revenue: ₹${c.revenue} | Avg: ₹${c.avgPrice}`
      ).join('\n\n');
      bot.sendMessage(chatId, `📊 <b>Category Performance</b>\n\n${list}`, { parse_mode: 'HTML' });
    }

    // ========== PRICE & INVENTORY ==========
    else if (query.includes('price') && query.includes('analysis')) {
      const data = await getPriceAnalysis();
      let message = `💰 <b>Price Analysis</b>\n\n` +
        `Average: ₹${data.avgPrice}\n` +
        `Highest: ₹${data.maxPrice}\n` +
        `Lowest: ₹${data.minPrice}`;
      
      if (data.discounted.length > 0) {
        message += `\n\n🎉 <b>Top Discounted Products:</b>\n`;
        message += data.discounted.map((p, i) => 
          `${i + 1}. ${p.name} - ${p.discountPercent}% off (₹${p.discount})`
        ).join('\n');
      }
      
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    }

    else if (query.includes('silver') && query.includes('inventory')) {
      const data = await getSilverInventory();
      const avgSilver = data.productCount > 0 ? (parseFloat(data.totalSilver) / data.productCount).toFixed(2) : 0;
      bot.sendMessage(chatId, 
        `⚖️ <b>Silver Inventory Status</b>\n\n` +
        `Total Silver: ${data.totalSilver} grams\n` +
        `Total Gross: ${data.totalGross} grams\n` +
        `Products: ${data.productCount}\n\n` +
        `💡 Avg silver per product: ${avgSilver} grams`,
        { parse_mode: 'HTML' }
      );
    }

    else if (query.includes('delivery') && query.includes('stats')) {
      const data = await getDeliveryStats();
      const total = data.readyToShip + data.madeToOrder;
      const readyPercent = total > 0 ? ((data.readyToShip / total) * 100).toFixed(1) : 0;
      bot.sendMessage(chatId, 
        `🚚 <b>Delivery Type Breakdown</b>\n\n` +
        `✅ Ready to Ship: ${data.readyToShip} products (${readyPercent}%)\n` +
        `🔨 Made to Order: ${data.madeToOrder} products\n\n` +
        `💡 Ready-to-ship converts 50% faster!`,
        { parse_mode: 'HTML' }
      );
    }

    // ========== ORDER STATUS ==========
    else if (query.includes('order') && query.includes('status')) {
      const status = await getOrderStatus();
      bot.sendMessage(chatId, 
        `📦 <b>Order Status Summary</b>\n\n` +
        `⏳ Pending: ${status.pending}\n` +
        `✅ Confirmed: ${status.confirmed}\n` +
        `🔧 Processing: ${status.processing}\n` +
        `🚚 Shipped: ${status.shipped}\n` +
        `📬 Delivered: ${status.delivered}\n` +
        `❌ Cancelled: ${status.cancelled}`,
        { parse_mode: 'HTML' }
      );
    }

    else if (query.includes('pending')) {
      const status = await getOrderStatus();
      bot.sendMessage(chatId, `⏳ <b>Pending Orders: ${status.pending}</b>\n\n✅ Confirmed: ${status.confirmed}\n🚚 Shipped: ${status.shipped}`, { parse_mode: 'HTML' });
    }

    // ========== STOCK ==========
    else if (query.includes('stock') || query.includes('inventory')) {
      if (query.includes('low')) {
        const lowStock = await getLowStock();
        if (lowStock.length === 0) {
          bot.sendMessage(chatId, '✅ All products have sufficient stock!');
        } else {
          const list = lowStock.map(p => `• ${p.name} - ${p.stock} left`).join('\n');
          bot.sendMessage(chatId, `⚠️ <b>Low Stock Alert</b>\n\n${list}`, { parse_mode: 'HTML' });
        }
      } else if (query.includes('out')) {
        const outOfStock = await getOutOfStock();
        if (outOfStock.length === 0) {
          bot.sendMessage(chatId, '✅ No products out of stock!');
        } else {
          const list = outOfStock.map(p => `• ${p.name}${p.wishlisted > 0 ? ` (${p.wishlisted} wishlists!)` : ''}`).join('\n');
          bot.sendMessage(chatId, `🔴 <b>Out of Stock</b>\n\n${list}\n\n💡 High wishlists = High demand!`, { parse_mode: 'HTML' });
        }
      }
    }

    // ========== CUSTOMERS ==========
    else if (query.includes('new') && query.includes('customer')) {
      const customers = await getNewCustomers();
      if (customers.length === 0) {
        bot.sendMessage(chatId, '📭 No new customers today.');
      } else {
        const list = customers.map(c => `• ${c.name} - ${c.email}`).join('\n');
        bot.sendMessage(chatId, `👥 <b>New Customers Today: ${customers.length}</b>\n\n${list}`, { parse_mode: 'HTML' });
      }
    }

    else if (query.includes('vip') || query.includes('repeat') || query.includes('top customer')) {
      const vips = await getVIPCustomers();
      if (vips.length === 0) {
        bot.sendMessage(chatId, '📭 No VIP customers yet.');
      } else {
        const list = vips.map((c, i) => `${i + 1}. ${c.name} - ${c.orders} orders - ₹${c.spent}`).join('\n');
        bot.sendMessage(chatId, `🌟 <b>VIP Customers (3+ orders)</b>\n\n${list}`, { parse_mode: 'HTML' });
      }
    }

    // ========== COMPARISON ==========
    else if (query.includes('compare') && query.includes('month')) {
      const data = await compareMonths();
      const growthIcon = parseFloat(data.growth) >= 0 ? '📈' : '📉';
      bot.sendMessage(chatId,
        `📊 <b>Monthly Comparison</b>\n\n` +
        `<b>Last Month:</b>\n` +
        `Orders: ${data.lastMonth.orders} | Revenue: ₹${data.lastMonth.revenue}\n\n` +
        `<b>This Month:</b>\n` +
        `Orders: ${data.thisMonth.orders} | Revenue: ₹${data.thisMonth.revenue}\n\n` +
        `${growthIcon} <b>Growth: ${data.growth}%</b>`,
        { parse_mode: 'HTML' }
      );
    }

    // ========== COUPONS ==========
    else if (query.includes('coupon')) {
      const stats = await getCouponStats();
      if (stats.length === 0) {
        bot.sendMessage(chatId, '📭 No active coupons.');
      } else {
        const list = stats.map(s => `• ${s.code}: Used ${s.usageCount} times - ₹${s.totalDiscount} discount`).join('\n');
        bot.sendMessage(chatId, `🎟️ <b>Coupon Statistics</b>\n\n${list}`, { parse_mode: 'HTML' });
      }
    }

    // ========== HELP ==========
    else {
      bot.sendMessage(chatId, 
        '🤔 I didn\'t understand that. Try:\n\n' +
        '• "Revenue today"\n' +
        '• "Top products"\n' +
        '• "Most viewed"\n' +
        '• "Conversion rate"\n' +
        '• "Dead stock"\n' +
        '• "Category performance"\n' +
        '• "Price analysis"\n' +
        '• "Silver inventory"\n' +
        '• "Pending orders"\n' +
        '• "Low stock"\n' +
        '• "VIP customers"\n' +
        '• "Compare months"'
      );
    }

  } catch (error) {
    console.error('Maya bot error:', error);
    bot.sendMessage(chatId, '❌ Sorry, I encountered an error. Please try again.');
  }
});

// ============================================
// 🔔 PROACTIVE ALERTS (Every 6 hours)
// ============================================

const sendProactiveAlerts = async () => {
  try {
    // Low stock alert
    const lowStock = await getLowStock(5);
    if (lowStock.length > 0) {
      const list = lowStock.map(p => `• ${p.name} - ${p.stock} left`).join('\n');
      await bot.sendMessage(TELEGRAM_CHAT_ID, 
        `⚠️ <b>STOCK ALERT</b>\n\nLow Stock Products:\n${list}\n\n💡 Action: Reorder immediately!`, 
        { parse_mode: 'HTML' }
      );
    }

    // Out of stock with high demand
    const outOfStock = await getOutOfStock();
    const highDemand = outOfStock.filter(p => p.wishlisted >= 10);
    if (highDemand.length > 0) {
      const list = highDemand.map(p => `• ${p.name} - ${p.wishlisted} wishlists`).join('\n');
      await bot.sendMessage(TELEGRAM_CHAT_ID, 
        `🔴 <b>HIGH DEMAND OUT OF STOCK</b>\n\n${list}\n\n💰 Opportunity: Restock these products ASAP!`, 
        { parse_mode: 'HTML' }
      );
    }

    // Pending orders alert
    const status = await getOrderStatus();
    if (status.pending > 10) {
      await bot.sendMessage(TELEGRAM_CHAT_ID, 
        `⚠️ <b>PENDING ORDERS ALERT</b>\n\n${status.pending} orders are pending!\n\n💡 Action: Process orders immediately!`, 
        { parse_mode: 'HTML' }
      );
    }

  } catch (error) {
    console.error('Proactive alerts error:', error);
  }
};

// Run alerts every 6 hours
setInterval(sendProactiveAlerts, 6 * 60 * 60 * 1000);

// ============================================
// 📨 SEND MESSAGE FUNCTION
// ============================================

export const sendTelegramMessage = async (message) => {
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML' });
    console.log('✅ Telegram message sent');
  } catch (error) {
    console.error('❌ Telegram error:', error);
  }
};

console.log('🤖 Maya bot is running with advanced analytics...');