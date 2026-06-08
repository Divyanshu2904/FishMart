import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import sellerRoutes from './routes/seller.js';
import uploadRoutes from './routes/upload.js';
import reviewsRoutes from './routes/reviews.js';

// Load Env
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static('uploads'));

// Init Database
initDB()
  .then(() => {
    console.log('Database initialized successfully.');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });

// Simple health check route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FishMart API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
