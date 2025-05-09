import express from 'express';
import { User } from '../models/User.js';
import { verifyGoogleToken, generateToken, authenticateToken } from '../middleware/auth.js';
import { userStore } from '../data/userStore.js';
import mongoose from 'mongoose';

export const router = express.Router();

const isMongoConnected = () => mongoose.connection.readyState === 1;

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'No credential provided' });
    }

    const payload = await verifyGoogleToken(credential);

    if (payload.error) {
      return res.status(403).json({ message: payload.error });
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    let user;
    
    if (isMongoConnected()) {
      user = await User.findOne({ email: payload.email });

      if (!user) {
        user = await User.create({
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          googleId: payload.sub,
        });
      }
    } else {
      user = await userStore.findByEmail(payload.email);

      if (!user) {
        user = await userStore.createUser({
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          googleId: payload.sub,
        });
      }
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message 
    });
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('User verification error:', error);
    res.status(401).json({ 
      message: 'User verification failed',
      error: error.message 
    });
  }
});