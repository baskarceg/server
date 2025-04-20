import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userType: {
    type: String,
    enum: ['Student', 'Parent', 'Professional', 'Admin'],
    default: 'Student',
  },
  degree: { type: String, required: true },
  yearOfEducation: { type: String, required: true },
  birthDate: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  schoolOrCollegeName: { type: String, required: true },
  password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
