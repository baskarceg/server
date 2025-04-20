import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getRegisteredUsersCount
} from '../controllers/authController.js';
import { validateRegistration } from '../validators/userValidators.js';

const router = express.Router();

router.post('/register',validateRegistration, registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/count', getRegisteredUsersCount);

export default router;
