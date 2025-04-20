import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('userType').notEmpty().withMessage('User type is required'),
  body('degree').notEmpty().withMessage('Degree is required'),
  body('yearOfEducation').notEmpty().withMessage('Year of education is required'),
  body('birthDate').notEmpty().isISO8601().withMessage('Valid birthdate is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobileNumber').matches(/^\d{10}$/).withMessage('Mobile number must be 10 digits'),
  body('schoolOrCollegeName').notEmpty().withMessage('School or college name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: 'Validation Error', errors: errors.array() });
    }
    next();
  },
];
