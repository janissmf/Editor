import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { userStore } from '../data/userStore.js';
import mongoose from 'mongoose';
import allowedEmails from '../config/allowed-emails.json' with { type: 'json' };

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

const isMongoConnected = () => mongoose.connection.readyState === 1;

const DEFAULT_USER = {
  _id: 'public',
  email: 'public@example.com',
  name: 'Public User',
  picture: '',
};

export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    // Check if email is in allowed list when AUTH_ENABLED is true
    if (process.env.AUTH_ENABLED !== 'false' && !allowedEmails.allowedEmails.includes(payload.email)) {
      return { error: 'Your email is not authorized to access this application. Please contact the administrator.' };
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const authenticateToken = async (req, res, next) => {
  // If auth is disabled, use default public user
  if (process.env.AUTH_ENABLED === 'false') {
    req.user = DEFAULT_USER;
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    let user;
    if (isMongoConnected()) {
      user = await User.findById(decoded.userId);
    } else {
      user = await userStore.findById(decoded.userId);
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};