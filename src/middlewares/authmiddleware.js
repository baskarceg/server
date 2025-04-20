import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js'; // Assuming your User model exists

export const isAdmin = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request object

    // Check if the user is an admin
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'Admin') {
      return res.status(403).json({ msg: 'Access denied, admin only' });
    }

    next(); // Proceed to the next middleware or route handler if admin
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
