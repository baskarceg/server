import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import mailRoutes from './routes/mailRoutes.js';
import swotRoutes from './routes/swotRoutes.js';
import adminRoutes from './routes/adminroutes.js';
import authRoutes from './routes/authroutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Built-in body-parser middleware
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', mailRoutes);
app.use('/api', swotRoutes);
// app.use('/api', adminRoutes);
app.use('/api/auth', authRoutes);

// Database Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully.');
    // Start server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});
