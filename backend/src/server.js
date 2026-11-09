import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seedData.js';

import authRoutes from './routes/authRoutes.js';
import pondRoutes from './routes/pondRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import waterQualityRoutes from './routes/waterQualityRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import harvestRoutes from './routes/harvestRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'ShrimpGuard API',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Manual / Dev Trigger for Database Re-seeding
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Sample demo data seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ponds', pondRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/water-quality', waterQualityRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`🦐 ShrimpGuard Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
