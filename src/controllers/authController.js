import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
export const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    userType,
    degree,
    yearOfEducation,
    birthDate,
    email,
    mobileNumber,
    schoolOrCollegeName,
    password,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const user = await User.create({
      firstName,
      lastName,
      userType,
      degree,
      yearOfEducation,
      birthDate,
      email,
      mobileNumber,
      schoolOrCollegeName,
      password,
    });

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error registering user', error: err.message });
  }
};


// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password/${token}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
// Reset Password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: 'Invalid token or user not found' });

    user.password = newPassword;
    await user.save();
    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
};

// Count All Registered Users
export const getRegisteredUsersCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Error', error: err.message });
  }
};
