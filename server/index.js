import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as nodeRoutes } from './routes/nodes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to explicitly allow requests from frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/nodes', nodeRoutes);

// Try MongoDB connection, fallback to file storage
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.log('MongoDB connection failed, using file storage:', err.message);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});