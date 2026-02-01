import TelegramBot from 'node-telegram-bot-api';
import Order from '../models/order.js';
import Product from '../models/products.js';
import User from '../models/user.js';
import Coupon from '../models/Coupon.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, process.env.NODE_ENV === 'production' ? {} : { polling: true });


// ============================================
// 🎭 MAYA PERSONALITY & RESPONSES
// ============================================

const MAYA_RESPONSES = {
  greetings: [
    "🙋‍♀️ Haan ji, main yahi hoon! Batao kya chahiye?",
    "🌟 Present! Bol do boss, kya kaam hai?",
    "💁‍♀️ Main toh yahi khadi hoon! Order do apna!",
    "✨ Haanji, Maya hazir hai! Kya service chahiye?",
    "🎯 Ready to rock! Batao kya analyze karna hai?"
  ],
  
  timeGreetings: {
    morning: [
      "☀️ Good morning boss!",
      "🌅 Subah ho gayi?  Let's make money today!",
      "🌄 Rise and shine! Aaj ka target kya hai?"
    ],
    afternoon: [
      "☀️ Afternoon boss! Lunch break? Ya paise ginne hain? 💰",
      "🌤️ Dopahar ka time! Sales check karo!",
      "⛅ Half day done! Dekhte hain aaj kitna kamaya!"
    ],
    evening: [
      "🌆 Evening vibes! Aaj ka revenue dekhein?",
      "🌃 Shaam ho gayi! Orders ka hisaab lagao!",
      "🌇 Evening! Time to count today's success!"
    ],
    night: [
      "🌙 Late night grind! Respect boss! 💪",
      "✨ Raat ko bhi kaam? Dedication! 🔥",
      "🌃 Night owl ho kya? Business checking? Nice!"
    ]
  },
  
  status: [
    "😊 Main toh mast hoon! Bas tumhare orders count kar rahi thi!",
    "💪 Ekdum fit! Business ke numbers dekh dekh ke khush ho rahi hoon!",
    "🔥 Bindaas! Aaj ka revenue dekh ke dil khush hai!",
    "✨ Sab badhiya! Tumhare customers bhi khush, main bhi khush!",
    "🎉 Zabardast! Aaj ek VIP customer ne order kiya, celebrate karo!"
  ],
  
  capabilities: [
    "🤖 Main kaafi kuch kar sakti hoon! Revenue track kar sakti, orders manage kar sakti, inventory check kar sakti, aur tumhe funny jokes bhi suna sakti! 😄\n\nTry:\n• Maya aaj kitna kamaya?\n• Maya pending orders?\n• Maya joke sunao!\n• Maya action items?\n• Maya daily summary?",
    "💡 Boht kuch! Main tumhari business analyst, accountant, aur comedian sab kuch hoon! 😎\n\nCommands:\n• Revenue analysis\n• Product insights\n• Customer stats\n• Cart abandonment\n• Action items\n• Funny responses",
    "🌟 Sab kuch jo tumhe business chalaane mein madad kare! Plus, main boring nahi hoon - mast replies deti hoon! 💃\n\nQuick Commands:\n• /quick - Instant summary\n• /todo - Action items\n• /compare - Yesterday vs Today"
  ],
  
  jokes: [
    "😂 Customer ne pucha: 'Delivery kitne din mein hogi?' Maine kaha: 'Jitni der aap order confirm karne mein loge!' 😄",
    "🤣 Ek order pending tha 2 din se. Maine usko message kiya: 'Bhai sahab, aapke order ko bhi family se milna hai!' 😅",
    "😆 Silver jewellery itni chamakdar hai ke customer ne poocha: 'Yeh torch hai ya necklace?' 💎✨",
    "🤭 Aaj ek customer ne 5 baar cart clear kiya. Main samajh gayi - window shopping expert hai! 🛒",
    "😂 Wishlist mein 50 items hai ek customer ki. Maine pucha: 'Shaadi kar rahe ho ya museum khol rahe ho?' 💍",
    "🤣 Customer: 'Is it pure silver?' Maine kaha: 'Haan, itna pure ke main khud blind ho jati hoon chamak se!' ✨",
    "😅 Order delivered hua, customer ne 5-star review diya. Maine socha: 'Aaj mera bhi promotion hoga!' 🌟"
  ],
  
  motivation: [
    "💪 Boss, aaj 3 new orders aaye hain! Keep pushing!",
    "🔥 Last week se 20% zyada revenue! You're killing it!",
    "✨ Tumhari mehnat rang la rahi hai! Sales badh rahe hain!",
    "🎯 Focus rakho! Success aa hi rahi hai!",
    "🚀 Business rockstar ho tum! Keep going!",
    "💎 Every order brings you closer to your goal!",
    "⭐ You're doing amazing! Customers love you!"
  ],
  
  celebrations: [
    "🎉 PARTY TIME! Aaj 10 orders cross kar gaye! Treat yourself! 🥳",
    "💰 BOOM! Revenue 50k cross kar gaya! You're on fire! 🔥",
    "🌟 Milestone alert! 100th order of the month! Celebrate karo! 🎊",
    "🏆 New record! Highest revenue day! Proud of you boss! 💪",
    "🎈 First sale before 9 AM! Early bird catches the worm! 🐦"
  ],
  
  warnings: [
    "⚠️ ALERT! 3 din se koi order nahi! Marketing boost karo! 📣",
    "🔴 URGENT! Stock critically low - 5+ products! Reorder now! 📦",
    "😰 WARNING! 15+ pending orders! Processing speed check karo!",
    "⏰ OLD ORDERS! 5 orders pending for 2+ days! Action needed!",
    "🚨 DEMAND HIGH! Out-of-stock items have 20+ wishlists! Restock!"
  ],
  
  insights: [
    "💡 Weekend pe sales 30% zyada hoti hai - plan accordingly!",
    "📊 Evening 6-9 PM pe sabse zyada orders aate hain!",
    "🎯 Silver rings sabse fast bikti hain - stock more!",
    "✨ Ready-to-ship items convert 2x better than made-to-order!",
    "🔥 Customers who wishlist have 40% higher chance to buy!",
    "💰 VIP customers spend 3x more - give them special treatment!"
  ],
  
  errors: [
    "🤔 Sorry boss, samajh nahi aayi baat. Thoda clear karo?",
    "😅 Confuse ho gayi main! Phir se batao?",
    "🙈 Oops! Yeh toh maine seekha nahi. Kuch aur pucho!",
    "💭 Hmm, yeh command naya hai mere liye. Try another one?",
    "🤷‍♀️ Sorry, yeh wala nahi aata mujhe. Help chahiye to type: Maya help"
  ]
};

// Random response selector
const getRandomResponse = (array) => array[Math.floor(Math.random() * array.length)];

// Time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return getRandomResponse(MAYA_RESPONSES.timeGreetings.morning);
  if (hour >= 12 && hour < 17) return getRandomResponse(MAYA_RESPONSES.timeGreetings.afternoon);
  if (hour >= 17 && hour < 21) return getRandomResponse(MAYA_RESPONSES.timeGreetings.evening);
  return getRandomResponse(MAYA_RESPONSES.timeGreetings.night);
};

// ============================================
// 📊 ANALYTICS FUNCTIONS
// ============================================

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

const getYesterdayRevenue = async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await Order.find({
    createdAt: { $gte: yesterday, $lt: today },
    paymentStatus: 'completed'
  });

  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    revenue: revenue.toFixed(2),
    orderCount: orders.length
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
  
  if (products.length === 0) {
    return { avgPrice: 0, maxPrice: 0, minPrice: 0, discounted: [] };
  }
  
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
// 🆕 NEW ANALYTICS FUNCTIONS
// ============================================

const getHourlyPerformance = async () => {
  const orders = await Order.find({ paymentStatus: 'completed' });
  
  const hourlyData = {};
  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = { count: 0, revenue: 0 };
    }
    hourlyData[hour].count++;
    hourlyData[hour].revenue += order.totalAmount;
  });
  
  const sorted = Object.entries(hourlyData)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);
  
  return sorted.map(([hour, data]) => ({
    hour: `${hour}:00 - ${parseInt(hour) + 1}:00`,
    orders: data.count,
    revenue: data.revenue.toFixed(2)
  }));
};

const getCartAbandonment = async () => {
  const users = await User.find({
    'cart.0': { $exists: true }
  }).populate('cart.product');
  
  let totalValue = 0;
  const abandonedItems = {};
  
  users.forEach(user => {
    user.cart.forEach(item => {
      const productName = item.product?.itemname || 'Unknown';
      if (!abandonedItems[productName]) {
        abandonedItems[productName] = 0;
      }
      abandonedItems[productName]++;
      totalValue += (item.product?.finalPrice || 0) * item.quantity;
    });
  });
  
  const topItems = Object.entries(abandonedItems)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  
  return {
    totalValue: totalValue.toFixed(2),
    userCount: users.length,
    topItems
  };
};

const getCustomerCLV = async () => {
  const customers = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        firstOrder: { $min: '$createdAt' },
        lastOrder: { $max: '$createdAt' }
      }
    },
    { $sort: { totalSpent: -1 } }
  ]);
  
  if (customers.length === 0) {
    return { avgCLV: '0', totalCustomers: 0 };
  }
  
  const avgCLV = customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length;
  
  return {
    avgCLV: avgCLV.toFixed(2),
    totalCustomers: customers.length,
    topSpender: customers[0]?.totalSpent.toFixed(2) || '0'
  };
};

const getReturnCustomerRate = async () => {
  const allCustomers = await Order.distinct('user', { paymentStatus: 'completed' });
  
  const returningCustomers = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: '$user', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  
  const returnRate = allCustomers.length > 0 
    ? (returningCustomers.length / allCustomers.length * 100).toFixed(1)
    : 0;
  
  return {
    totalCustomers: allCustomers.length,
    returningCustomers: returningCustomers.length,
    returnRate: returnRate
  };
};

const getSeasonalTrends = async () => {
  const orders = await Order.find({ paymentStatus: 'completed' });
  
  const monthly = {};
  orders.forEach(order => {
    const month = new Date(order.createdAt).toLocaleString('en', { month: 'short' });
    if (!monthly[month]) {
      monthly[month] = { orders: 0, revenue: 0 };
    }
    monthly[month].orders++;
    monthly[month].revenue += order.totalAmount;
  });
  
  return Object.entries(monthly)
    .map(([month, data]) => ({
      month,
      orders: data.orders,
      revenue: data.revenue.toFixed(2)
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

const getPaymentStats = async () => {
  const orders = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  return orders.map(o => ({
    method: o._id || 'COD/Unknown',
    orders: o.count,
    revenue: o.totalRevenue.toFixed(2)
  }));
};

const getActionItems = async () => {
  const actions = [];
  
  // Low stock (critical)
  const lowStock = await getLowStock(3);
  if (lowStock.length > 0) {
    actions.push({
      priority: '🔴 HIGH',
      action: `${lowStock.length} products critically low on stock`,
      items: lowStock.slice(0, 3).map(p => `${p.name} (${p.stock} left)`)
    });
  }
  
  // Pending orders > 2 days
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const oldPending = await Order.find({
    orderStatus: 'pending',
    createdAt: { $lt: twoDaysAgo }
  });
  if (oldPending.length > 0) {
    actions.push({
      priority: '🟠 MEDIUM',
      action: `${oldPending.length} orders pending for 2+ days`,
      items: oldPending.slice(0, 3).map(o => `Order #${o._id.toString().slice(-6)}`)
    });
  }
  
  // High wishlist, out of stock
  const outOfStock = await getOutOfStock();
  const highDemand = outOfStock.filter(p => p.wishlisted >= 5);
  if (highDemand.length > 0) {
    actions.push({
      priority: '🟡 MEDIUM',
      action: `${highDemand.length} out-of-stock items with high demand`,
      items: highDemand.slice(0, 3).map(p => `${p.name} (${p.wishlisted} wishlists)`)
    });
  }
  
  // Cart abandonment
  const cartData = await getCartAbandonment();
  if (parseFloat(cartData.totalValue) > 10000) {
    actions.push({
      priority: '🟡 LOW',
      action: `₹${cartData.totalValue} worth of abandoned carts`,
      items: [`${cartData.userCount} users with items in cart - Send reminder!`]
    });
  }
  
  return actions;
};

const getDailySummary = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [revenue, newUsers, orders, topProduct] = await Promise.all([
    getTodayRevenue(),
    getNewCustomers(),
    getOrderStatus(),
    getTopProducts(1)
  ]);
  
  return {
    revenue: revenue.revenue,
    orders: revenue.orderCount,
    avgOrder: revenue.avgOrderValue,
    newCustomers: newUsers.length,
    pending: orders.pending,
    topProduct: topProduct[0]?.name || 'None'
  };
};

// ============================================
// 🤖 ENHANCED BOT COMMANDS WITH NLP
// ============================================

bot.onText(/maya|Maya|MAYA/i, async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  try {
    // ========== GREETINGS & STATUS ==========
    if (
      /kahan\s*(hai|ho)?/.test(text) ||
      /kidhar/.test(text) ||
      /present/.test(text) ||
      /^(maya|hey maya|hi maya)[\s,]*$/i.test(text)
    ) {
      bot.sendMessage(chatId, getTimeBasedGreeting());
      return;
    }

    if (
      /(kya\s*haal|kaisi\s*ho|how\s*are\s*you|kaise\s*ho)/.test(text) ||
      /status/.test(text)
    ) {
      bot.sendMessage(chatId, getRandomResponse(MAYA_RESPONSES.status));
      return;
    }

    if (
      /(kya\s*kar\s*sakti|what\s*can\s*you|capabilities|help)/.test(text)
    ) {
      bot.sendMessage(chatId, getRandomResponse(MAYA_RESPONSES.capabilities));
      return;
    }

    // ========== JOKES & FUN ==========
    if (
      /(joke|hasao|funny|comedy|masti)/.test(text)
    ) {
      bot.sendMessage(chatId, getRandomResponse(MAYA_RESPONSES.jokes));
      return;
    }

    // ========== DAILY SUMMARY ==========
    if (
      /(daily.*summary|aaj.*report|quick.*summary|summary)/.test(text)
    ) {
      const summary = await getDailySummary();
      bot.sendMessage(chatId, 
        `📊 <b>Aaj Ka Quick Summary</b>\n\n` +
        `💰 Revenue: ₹${summary.revenue}\n` +
        `📦 Orders: ${summary.orders}\n` +
        `📈 Avg Order: ₹${summary.avgOrder}\n` +
        `👥 New Customers: ${summary.newCustomers}\n` +
        `⏳ Pending: ${summary.pending}\n` +
        `🔥 Top Product: ${summary.topProduct}\n\n` +
        `${getRandomResponse(MAYA_RESPONSES.motivation)}`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    // ========== ACTION ITEMS ==========
    if (
      /(action.*item|kya.*karna|urgent|priority|todo)/.test(text)
    ) {
      const actions = await getActionItems();
      if (actions.length === 0) {
        bot.sendMessage(chatId, "✅ Sab kuch control mein hai boss! No urgent actions needed! 🎉");
      } else {
        let message = `⚡ <b>Action Items (Priority Wise)</b>\n\n`;
        actions.forEach((action, i) => {
          message += `${action.priority} - ${action.action}\n`;
          action.items.forEach(item => {
            message += `   • ${item}\n`;
          });
          message += '\n';
        });
        bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      }
      return;
    }

    // ========== REVENUE QUERIES (HINDI + ENGLISH) ==========
    if (
      /(aaj\s*kitna\s*(kamaya|revenue|sales))/.test(text) ||
      /(today.*revenue|revenue.*today)/.test(text)
    ) {
      const data = await getTodayRevenue();
      if (data.orderCount === 0) {
        bot.sendMessage(chatId, "😔 Aaj tak koi order nahi aaya boss! Marketing karo! 📣");
      } else {
        bot.sendMessage(chatId, 
          `💰 <b>Aaj Ka Kamaal!</b>\n\n` +
          `🎉 Revenue: ₹${data.revenue}\n` +
          `📦 Orders: ${data.orderCount}\n` +
          `📈 Average: ₹${data.avgOrderValue}\n\n` +
          `${getRandomResponse(MAYA_RESPONSES.motivation)}`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    if (/(week|hafte|7\s*din)/.test(text) && /(revenue|kamaya|sales)/.test(text)) {
      const data = await getWeekRevenue();
      bot.sendMessage(chatId, 
        `📊 <b>Is Hafte Ka Report</b>\n\n` +
        `💰 Revenue: ₹${data.revenue}\n` +
        `📦 Orders: ${data.orderCount}\n\n` +
        `💪 Keep hustling!`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    if (/(month|mahine|30\s*din)/.test(text) && /(revenue|kamaya|sales)/.test(text)) {
      const data = await getMonthRevenue();
      bot.sendMessage(chatId, 
        `📊 <b>Is Mahine Ka Dhamaal</b>\n\n` +
        `💰 Revenue: ₹${data.revenue}\n` +
        `📦 Orders: ${data.orderCount}\n\n` +
        `🔥 Boss level performance!`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    // ========== PRODUCT QUERIES ==========
    if (/(top|best|sabse\s*zyada)/.test(text) && /(product|item|bik)/.test(text)) {
      const products = await getTopProducts();
      if (products.length === 0) {
        bot.sendMessage(chatId, "📭 Abhi tak koi product nahi bika! First sale ka wait hai! 🎯");
      } else {
        const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.count} sales 🔥`).join('\n');
        bot.sendMessage(chatId, `🏆 <b>Top Selling Rockstars!</b>\n\n${list}`, { parse_mode: 'HTML' });
      }
      return;
    }

    if (/(most.*view|sabse.*dekh|popular)/.test(text)) {
      const products = await getMostViewedProducts();
      const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.views} views 👀 (${p.orders} sales)`).join('\n');
      bot.sendMessage(chatId, `🔥 <b>Sabse Zyada Dekhe Gaye!</b>\n\n${list}`, { parse_mode: 'HTML' });
      return;
    }

    if (/(wishlist|pasand)/.test(text)) {
      const products = await getMostWishlisted();
      const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.wishlisted} ❤️ ${p.inStock ? '✅' : '❌ Stock khatam!'}`).join('\n');
      bot.sendMessage(chatId, `❤️ <b>Sabse Zyada Pasand Kiye Gaye!</b>\n\n${list}`, { parse_mode: 'HTML' });
      return;
    }

    if (/conversion/.test(text)) {
      const products = await getConversionRate();
      const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.conversionRate}% 🎯`).join('\n');
      bot.sendMessage(chatId, 
        `📊 <b>Conversion Champions!</b>\n\n${list}\n\n💡 2-5% is good conversion!`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    if (/(dead\s*stock|bekar|nahi\s*bik)/.test(text)) {
      const products = await getDeadStock();
      if (products.length === 0) {
        bot.sendMessage(chatId, "✅ Sab kuch bik raha hai boss! No dead stock! 🎉");
      } else {
        const list = products.map((p, i) => `${i + 1}. ${p.name} - ${p.views} views par sale nahi! 😢`).join('\n');
        bot.sendMessage(chatId, 
          `⚠️ <b>Ye Nahi Bik Rahe!</b>\n\n${list}\n\n💡 <b>Action:</b>\n• Price kam karo\n• Photos improve karo\n• Sale lagao!`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    if (/category.*perform/.test(text)) {
      const categories = await getCategoryStats();
      const list = categories.map((c, i) => 
        `${i + 1}. <b>${c.category.toUpperCase()}</b>\n` +
        `   📦 ${c.products} products | 💰 ₹${c.revenue}`
      ).join('\n\n');
      bot.sendMessage(chatId, `📊 <b>Category Wise Kamaal!</b>\n\n${list}`, { parse_mode: 'HTML' });
      return;
    }

    // ========== NEW ANALYTICS ==========
    if (/(best|peak|busy).*hour/.test(text) || /hourly.*performance/.test(text)) {
      const hours = await getHourlyPerformance();
      if (hours.length === 0) {
        bot.sendMessage(chatId, "📭 Abhi data nahi hai boss! Orders aane do!");
      } else {
        const list = hours.map((h, i) => 
          `${i + 1}. ${h.hour} - ${h.orders} orders - ₹${h.revenue}`
        ).join('\n');
        bot.sendMessage(chatId, 
          `⏰ <b>Best Performing Hours</b>\n\n${list}\n\n💡 Peak hours pe special offers do!`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    if (/(cart.*abandon|chhodh.*diya|abandoned.*cart)/.test(text)) {
      const cartData = await getCartAbandonment();
      if (cartData.userCount === 0) {
        bot.sendMessage(chatId, "✅ Koi abandoned cart nahi! Sab convert ho rahe! 🎉");
      } else {
        let message = `🛒 <b>Cart Abandonment Alert!</b>\n\n` +
          `👥 ${cartData.userCount} users\n` +
          `💰 Total Value: ₹${cartData.totalValue}\n\n`;
        
        if (cartData.topItems.length > 0) {
          message += `<b>Most Abandoned:</b>\n`;
          cartData.topItems.forEach((item, i) => {
            message += `${i + 1}. ${item.name} - ${item.count} times\n`;
          });
          message += '\n💡 Send reminder emails!';
        }
        
        bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      }
      return;
    }

    if (/(customer.*value|clv|lifetime.*value)/.test(text)) {
      const clvData = await getCustomerCLV();
      bot.sendMessage(chatId, 
        `💎 <b>Customer Lifetime Value</b>\n\n` +
        `📊 Average CLV: ₹${clvData.avgCLV}\n` +
        `👥 Total Customers: ${clvData.totalCustomers}\n` +
        `🌟 Top Spender: ₹${clvData.topSpender}\n\n` +
        `💡 Focus on customer retention!`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    if (/(return.*customer|repeat.*rate)/.test(text)) {
      const returnData = await getReturnCustomerRate();
      const isGood = parseFloat(returnData.returnRate) > 30;
      bot.sendMessage(chatId, 
        `🔄 <b>Returning Customer Rate</b>\n\n` +
        `👥 Total: ${returnData.totalCustomers}\n` +
        `🔁 Returning: ${returnData.returningCustomers}\n` +
        `📈 Rate: ${returnData.returnRate}%\n\n` +
        `${isGood ? '✅ Great! Keep it up!' : '⚠️ Work on retention - offer loyalty rewards!'}`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    if (/(season|trend|monthly)/.test(text)) {
      const trends = await getSeasonalTrends();
      if (trends.length === 0) {
        bot.sendMessage(chatId, "📭 Abhi data nahi hai boss!");
      } else {
        const list = trends.slice(0, 6).map((t, i) => 
          `${i + 1}. ${t.month} - ${t.orders} orders - ₹${t.revenue}`
        ).join('\n');
        bot.sendMessage(chatId, 
          `📊 <b>Monthly Trends</b>\n\n${list}\n\n💡 Plan inventory based on trends!`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    if (/(payment.*method|kaise.*pay)/.test(text)) {
      const paymentData = await getPaymentStats();
      if (paymentData.length === 0) {
        bot.sendMessage(chatId, "📭 No payment data yet!");
      } else {
        const list = paymentData.map((p, i) => 
          `${i + 1}. ${p.method} - ${p.orders} orders - ₹${p.revenue}`
        ).join('\n');
        bot.sendMessage(chatId, 
          `💳 <b>Payment Method Stats</b>\n\n${list}`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    // ========== ANALYSIS ==========
    if (/price.*analysis/.test(text)) {
      const data = await getPriceAnalysis();
      let message = `💰 <b>Price Analysis</b>\n\n` +
        `📊 Average: ₹${data.avgPrice}\n` +
        `⬆️ Highest: ₹${data.maxPrice}\n` +
        `⬇️ Lowest: ₹${data.minPrice}`;
      
      if (data.discounted.length > 0) {
        message += `\n\n🎉 <b>Top Discounts:</b>\n`;
        message += data.discounted.map((p, i) => 
          `${i + 1}. ${p.name} - ${p.discountPercent}% off!`
        ).join('\n');
      }
      
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return;
    }

    if (/(silver|chandi).*inventory/.test(text)) {
      const data = await getSilverInventory();
      const avgSilver = data.productCount > 0 ? (parseFloat(data.totalSilver) / data.productCount).toFixed(2) : 0;
      bot.sendMessage(chatId, 
        `⚖️ <b>Chandi Ka Hisaab</b>\n\n` +
        `🥈 Total Silver: ${data.totalSilver} grams\n` +
        `⚖️ Gross Weight: ${data.totalGross} grams\n` +
        `📦 Products: ${data.productCount}\n\n` +
        `💡 Per product avg: ${avgSilver} grams`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    if (/delivery.*stats/.test(text)) {
      const data = await getDeliveryStats();
      const total = data.readyToShip + data.madeToOrder;
      const readyPercent = total > 0 ? ((data.readyToShip / total) * 100).toFixed(1) : 0;
      bot.sendMessage(chatId, 
        `🚚 <b>Delivery Breakdown</b>\n\n` +
        `✅ Ready to Ship: ${data.readyToShip} (${readyPercent}%)\n` +
        `🔨 Made to Order: ${data.madeToOrder}\n\n` +
        `💡 Ready stock zyada fast bikta hai!`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    // ========== ORDERS ==========
    if (/(pending|baaki|rukhe)/.test(text) && /(order)/.test(text)) {
      const status = await getOrderStatus();
      if (status.pending === 0) {
        bot.sendMessage(chatId, "✅ Koi pending order nahi! Sab clear hai boss! 🎉");
      } else if (status.pending > 10) {
        bot.sendMessage(chatId, 
          `⚠️ <b>ALERT ALERT!</b>\n\n` +
          `😰 ${status.pending} orders pending hain!\n` +
          `✅ Confirmed: ${status.confirmed}\n` +
          `🚚 Shipped: ${status.shipped}\n\n` +
          `💡 Jaldi process karo boss!`,
          { parse_mode: 'HTML' }
        );
      } else {
        bot.sendMessage(chatId, 
          `📦 <b>Pending Orders</b>\n\n` +
          `⏳ Pending: ${status.pending}\n` +
          `✅ Confirmed: ${status.confirmed}\n` +
          `🚚 Shipped: ${status.shipped}`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    if (/order.*status/.test(text)) {
      const status = await getOrderStatus();
      bot.sendMessage(chatId, 
        `📦 <b>Sab Orders Ka Haal</b>\n\n` +
        `⏳ Pending: ${status.pending}\n` +
        `✅ Confirmed: ${status.confirmed}\n` +
        `🔧 Processing: ${status.processing}\n` +
        `🚚 Shipped: ${status.shipped}\n` +
        `📬 Delivered: ${status.delivered}\n` +
        `❌ Cancelled: ${status.cancelled}`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    // ========== STOCK ==========
    if (/(low.*stock|kam.*stock|khatam)/.test(text)) {
      const lowStock = await getLowStock();
      if (lowStock.length === 0) {
        bot.sendMessage(chatId, "✅ Sab products mein stock hai! Tension mat lo! 😎");
      } else {
        const list = lowStock.map(p => `• ${p.name} - Sirf ${p.stock} bacha! ⚠️`).join('\n');
        bot.sendMessage(chatId, 
          `⚠️ <b>Stock Kam Ho Raha Hai!</b>\n\n${list}\n\n💡 Reorder karo jaldi!`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    if (/(out.*stock|stock.*khatam)/.test(text)) {
      const outOfStock = await getOutOfStock();
      if (outOfStock.length === 0) {
        bot.sendMessage(chatId, "✅ Koi product out of stock nahi! All good! 🎉");
      } else {
        const list = outOfStock.map(p => `• ${p.name}${p.wishlisted > 0 ? ` (${p.wishlisted} log wait kar rahe!)` : ''}`).join('\n');
        bot.sendMessage(chatId, 
          `🔴 <b>Out of Stock!</b>\n\n${list}\n\n💰 Restock karo - demand hai!`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    // ========== CUSTOMERS ==========
    if (/(new|naye).*customer/.test(text)) {
      const customers = await getNewCustomers();
      if (customers.length === 0) {
        bot.sendMessage(chatId, "📭 Aaj naye customer nahi aaye. Marketing karo boss! 📣");
      } else {
        const list = customers.map(c => `• ${c.name} 🎉`).join('\n');
        bot.sendMessage(chatId, 
          `👥 <b>Aaj Ke Naye Customers!</b>\n\n${list}\n\n✨ Welcome them well!`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    if (/(vip|repeat|top.*customer)/.test(text)) {
      const vips = await getVIPCustomers();
      if (vips.length === 0) {
        bot.sendMessage(chatId, "📭 Abhi VIP customers nahi bane! Work hard! 💪");
      } else {
        const list = vips.map((c, i) => `${i + 1}. ${c.name} - ${c.orders} orders - ₹${c.spent} 💎`).join('\n');
        bot.sendMessage(chatId, 
          `🌟 <b>VIP Customers (Real MVPs!)</b>\n\n${list}\n\n💖 Inhe special treatment do!`,
          { parse_mode: 'HTML' }
        );
      }
      return;
    }

    // ========== COMPARISON ==========
    if (/(compare|tulna).*month/.test(text)) {
      const data = await compareMonths();
      const growthIcon = parseFloat(data.growth) >= 0 ? '📈' : '📉';
      const growthText = parseFloat(data.growth) >= 0 ? 'Badiya growth! 🔥' : 'Thoda slow hai, push karo! 💪';
      
      bot.sendMessage(chatId,
        `📊 <b>Last Month vs This Month</b>\n\n` +
        `<b>Last Month:</b>\n` +
        `📦 ${data.lastMonth.orders} orders | 💰 ₹${data.lastMonth.revenue}\n\n` +
        `<b>This Month:</b>\n` +
        `📦 ${data.thisMonth.orders} orders | 💰 ₹${data.thisMonth.revenue}\n\n` +
        `${growthIcon} <b>Growth: ${data.growth}%</b>\n\n${growthText}`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    // ========== COUPONS ==========
    if (/coupon/.test(text)) {
      const stats = await getCouponStats();
      if (stats.length === 0) {
        bot.sendMessage(chatId, "📭 Koi active coupon nahi hai abhi!");
      } else {
        const list = stats.map(s => `• ${s.code}: ${s.usageCount} baar use - ₹${s.totalDiscount} discount`).join('\n');
        bot.sendMessage(chatId, `🎟️ <b>Coupon Stats</b>\n\n${list}`, { parse_mode: 'HTML' });
      }
      return;
    }

    // ========== DEFAULT - DIDN'T UNDERSTAND ==========
    bot.sendMessage(chatId, getRandomResponse(MAYA_RESPONSES.errors));

  } catch (error) {
    console.error('Maya bot error:', error);
    bot.sendMessage(chatId, "😅 Oops! Kuch gadbad ho gayi. Phir se try karo!");
  }
});

// ============================================
// 🎯 QUICK COMMAND SHORTCUTS
// ============================================

bot.onText(/^\/quick$/i, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const summary = await getDailySummary();
    bot.sendMessage(chatId, 
      `⚡ <b>Quick Summary</b>\n\n` +
      `💰 Revenue: ₹${summary.revenue}\n` +
      `📦 Orders: ${summary.orders}\n` +
      `👥 New Customers: ${summary.newCustomers}\n` +
      `⏳ Pending: ${summary.pending}\n\n` +
      `🔥 Top: ${summary.topProduct}`,
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    bot.sendMessage(chatId, "Error fetching summary!");
  }
});

bot.onText(/^\/todo$/i, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const actions = await getActionItems();
    if (actions.length === 0) {
      bot.sendMessage(chatId, "✅ No urgent tasks! All good! 🎉");
    } else {
      let message = `📋 <b>To-Do List</b>\n\n`;
      actions.forEach(action => {
        message += `${action.priority} ${action.action}\n`;
      });
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    }
  } catch (error) {
    bot.sendMessage(chatId, "Error fetching action items!");
  }
});

bot.onText(/^\/compare$/i, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const [today, yesterday] = await Promise.all([
      getTodayRevenue(),
      getYesterdayRevenue()
    ]);
    
    const diff = parseFloat(today.revenue) - parseFloat(yesterday.revenue);
    const diffIcon = diff >= 0 ? '📈' : '📉';
    
    bot.sendMessage(chatId,
      `📊 <b>Today vs Yesterday</b>\n\n` +
      `<b>Yesterday:</b>\n₹${yesterday.revenue} (${yesterday.orderCount} orders)\n\n` +
      `<b>Today:</b>\n₹${today.revenue} (${today.orderCount} orders)\n\n` +
      `${diffIcon} Difference: ₹${Math.abs(diff).toFixed(2)}`,
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    bot.sendMessage(chatId, "Error comparing data!");
  }
});

// ============================================
// 🎤 VOICE NOTE HANDLER
// ============================================

bot.on('voice', async (msg) => {
  bot.sendMessage(msg.chat.id, 
    "🎤 Voice note suna! Par abhi main sirf text samajhti hoon! 😅\n\n" +
    "Type karo examples:\n" +
    "• Maya aaj kitna kamaya?\n" +
    "• Maya action items?\n" +
    "• /quick"
  );
});

// ============================================
// 🔔 PROACTIVE ALERTS (Every 6 hours)
// ============================================

const sendProactiveAlerts = async () => {
  try {
    const lowStock = await getLowStock(5);
    if (lowStock.length > 0) {
      const list = lowStock.map(p => `• ${p.name} - ${p.stock} left`).join('\n');
      await bot.sendMessage(TELEGRAM_CHAT_ID, 
        `⚠️ <b>STOCK ALERT!</b>\n\n${list}\n\n💡 Boss, reorder karo jaldi!`, 
        { parse_mode: 'HTML' }
      );
    }

    const outOfStock = await getOutOfStock();
    const highDemand = outOfStock.filter(p => p.wishlisted >= 10);
    if (highDemand.length > 0) {
      const list = highDemand.map(p => `• ${p.name} - ${p.wishlisted} wishlists!`).join('\n');
      await bot.sendMessage(TELEGRAM_CHAT_ID, 
        `🔴 <b>HIGH DEMAND!</b>\n\n${list}\n\n💰 Ye log wait kar rahe! Restock karo!`, 
        { parse_mode: 'HTML' }
      );
    }

    const status = await getOrderStatus();
    if (status.pending > 10) {
      await bot.sendMessage(TELEGRAM_CHAT_ID, 
        `⚠️ <b>PENDING ORDERS ALERT!</b>\n\n${status.pending} orders pending!\n\n💡 Process karo boss!`, 
        { parse_mode: 'HTML' }
      );
    }

    // Cart abandonment alert
    const cartData = await getCartAbandonment();
    if (parseFloat(cartData.totalValue) > 20000) {
      await bot.sendMessage(TELEGRAM_CHAT_ID,
        `🛒 <b>CART ABANDONMENT!</b>\n\n` +
        `₹${cartData.totalValue} worth in abandoned carts!\n` +
        `${cartData.userCount} users waiting!\n\n` +
        `💡 Send reminder emails!`,
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
// 🎉 CELEBRATION ALERTS (Check every hour)
// ============================================

let lastMilestone = {
  orders: 0,
  revenue: 0
};

const checkMilestones = async () => {
  try {
    const today = await getTodayRevenue();
    const orders = parseInt(today.orderCount);
    const revenue = parseFloat(today.revenue);

    // Check order milestones (10, 25, 50, 100)
    const orderMilestones = [10, 25, 50, 100];
    for (const milestone of orderMilestones) {
      if (orders >= milestone && lastMilestone.orders < milestone) {
        await bot.sendMessage(TELEGRAM_CHAT_ID,
          `🎉 <b>MILESTONE ALERT!</b>\n\n` +
          `${orders} orders today! You hit ${milestone}! 🚀\n\n` +
          `${getRandomResponse(MAYA_RESPONSES.celebrations)}`,
          { parse_mode: 'HTML' }
        );
        lastMilestone.orders = milestone;
      }
    }

    // Check revenue milestones (10k, 25k, 50k, 100k)
    const revenueMilestones = [10000, 25000, 50000, 100000];
    for (const milestone of revenueMilestones) {
      if (revenue >= milestone && lastMilestone.revenue < milestone) {
        await bot.sendMessage(TELEGRAM_CHAT_ID,
          `💰 <b>REVENUE MILESTONE!</b>\n\n` +
          `₹${revenue} today! Crossed ₹${milestone/1000}k! 🔥\n\n` +
          `Boss, you're crushing it! 💎`,
          { parse_mode: 'HTML' }
        );
        lastMilestone.revenue = milestone;
      }
    }

  } catch (error) {
    console.error('Milestone check error:', error);
  }
};

// Check milestones every hour
setInterval(checkMilestones, 60 * 60 * 1000);

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

console.log('🤖 Maya bot is running with enhanced features, personality & Hindi support...');