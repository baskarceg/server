// routes/adminRoutes.js

import express from 'express';
import User from '../models/User.js'; // User model
import jwt from 'jsonwebtoken';

const router = express.Router();

// Protected route to check if the user is an admin
router.get('/check-admin', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Get token from the header
    if (!token) return res.status(403).json({ msg: 'No token provided' });

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID (assuming you store user ID in the token payload)
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check if the user is an admin
    if (user.role === 'admin') {
      return res.json({ isAdmin: true, user });
    }

    res.json({ isAdmin: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

export default router;
