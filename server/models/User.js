import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
  googleId: {
    type: String,
    sparse: true,
  }
}, {
  timestamps: true,
});

// Remove duplicate index declarations and only use schema options
// The unique: true option automatically creates indexes

export const User = mongoose.model('User', userSchema);