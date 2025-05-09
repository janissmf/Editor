import express from 'express';
import mongoose from 'mongoose';
import { Node } from '../models/Node.js';
import { authenticateToken } from '../middleware/auth.js';
import { store } from '../data/store.js';

export const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Helper function to determine if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Get all nodes for the authenticated user
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const nodes = await Node.find({ user_id: req.user._id }).sort({ order: 1, createdAt: 1 });
      res.json(nodes);
    } else {
      const nodes = await store.getAllNodes();
      res.json(nodes);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single node
router.get('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const node = await Node.findOne({ _id: req.params.id, user_id: req.user._id });
      if (!node) {
        return res.status(404).json({ message: 'Node not found' });
      }
      res.json(node);
    } else {
      const node = await store.getNode(req.params.id);
      if (!node) {
        return res.status(404).json({ message: 'Node not found' });
      }
      res.json(node);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a node
router.post('/', async (req, res) => {
  try {
    const nodeData = {
      label: req.body.label,
      description: req.body.description || '',
      parent_id: req.body.parent_id,
      is_expanded: req.body.is_expanded ?? true,
      order: req.body.order || 0,
      user_id: req.user._id,
    };

    if (isMongoConnected()) {
      const node = new Node(nodeData);
      const newNode = await node.save();
      res.status(201).json(newNode);
    } else {
      const newNode = await store.createNode(nodeData);
      res.status(201).json(newNode);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a node
router.patch('/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.label !== undefined) updates.label = req.body.label;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.parent_id !== undefined) updates.parent_id = req.body.parent_id;
    if (req.body.is_expanded !== undefined) updates.is_expanded = req.body.is_expanded;
    if (req.body.order !== undefined) updates.order = req.body.order;

    if (isMongoConnected()) {
      const updatedNode = await Node.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id },
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedNode) {
        return res.status(404).json({ message: 'Node not found' });
      }

      res.json(updatedNode);
    } else {
      const updatedNode = await store.updateNode(req.params.id, updates);
      res.json(updatedNode);
    }
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid node ID' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete a node
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const node = await Node.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
      if (!node) {
        return res.status(404).json({ message: 'Node not found' });
      }
      await Node.deleteMany({ parent_id: req.params.id, user_id: req.user._id });
      res.json({ message: 'Node deleted' });
    } else {
      await store.deleteNode(req.params.id);
      res.json({ message: 'Node deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get children nodes
router.get('/:id/children', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const children = await Node.find({ 
        parent_id: req.params.id,
        user_id: req.user._id 
      }).sort({ order: 1, createdAt: 1 });
      res.json(children);
    } else {
      const children = await store.getChildren(req.params.id);
      res.json(children);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});