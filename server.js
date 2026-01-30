import 'dotenv/config'

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from './config/db.js';
import paymentRoutes from './routes/payment.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import cartWishlistRoutes from './routes/cartWishlist.js';
import carouselRoutes from './routes/carouselRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import categoryRoutes from './routes/CategoryRoutes.js';
import reviewRoutes from './routes/reviews.js';

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://novara-frontend.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "https://novara-frontend.vercel.app"
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // temporarily allow all
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========

app.get('/', (req, res) => {
  res.json({
    message: 'Novara Jewels API is running',
    version: '1.0.0',
    status: 'active'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

//payment routes
app.use('/api/payment', paymentRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Cart and Wishlist routes
app.use('/api/users', cartWishlistRoutes);

//carousel routes
app.use('/api/carousel', carouselRoutes);

//coupon routes
app.use('/api/coupons', couponRoutes);

//category routes
app.use('/api/categories', categoryRoutes);

//review routes
app.use('/api/reviews', reviewRoutes);

// ========== ERROR HANDLING ==========

// Handle 404 - Not Found
app.use(notFound);

// Global error handler
app.use(errorHandler);
// ========== START SERVER ==========



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════════════════════════════════╗
    ║   Novara Jewels Backend Server                                     ║
    ║   Running on port ${PORT}                                          ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
    ╚════════════════════════════════════════════════════════════════════╝
    `);
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});