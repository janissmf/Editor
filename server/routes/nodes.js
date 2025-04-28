import express from 'express';
import mongoose from 'mongoose';
import { Node } from '../models/Node.js';
import { store } from '../data/store.js';

export const router = express.Router();

// Helper to determine if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Get all nodes
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const nodes = await Node.find().sort({ createdAt: 1 });
      return res.json(nodes);
    }
    const nodes = await store.getAllNodes();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single node
router.get('/:id', async (req, res) => {
  try {
    let node;
    if (isMongoConnected()) {
      node = await Node.findById(req.params.id);
    } else {
      node = await store.getNode(req.params.id);
    }
    
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }
    res.json(node);
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
    };

    let newNode;
    if (isMongoConnected()) {
      const node = new Node(nodeData);
      newNode = await node.save();
    } else {
      newNode = await store.createNode(nodeData);
    }
    res.status(201).json(newNode);
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

    let updatedNode;
    if (isMongoConnected()) {
      updatedNode = await Node.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );
    } else {
      updatedNode = await store.updateNode(req.params.id, updates);
    }

    if (!updatedNode) {
      return res.status(404).json({ message: 'Node not found' });
    }

    res.json(updatedNode);
  } catch (error) {
    // Proper error handling with specific status codes
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid node ID' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete a node
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const node = await Node.findById(req.params.id);
      if (!node) {
        return res.status(404).json({ message: 'Node not found' });
      }
      await Node.deleteMany({ parent_id: req.params.id });
      await node.deleteOne();
    } else {
      await store.deleteNode(req.params.id);
    }
    res.json({ message: 'Node deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get children nodes
router.get('/:id/children', async (req, res) => {
  try {
    let children;
    if (isMongoConnected()) {
      children = await Node.find({ parent_id: req.params.id }).sort({ createdAt: 1 });
    } else {
      children = await store.getChildren(req.params.id);
    }
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});