import express from 'express';
import { Node } from '../models/Node.js';

export const router = express.Router();

// Get all nodes
router.get('/', async (req, res) => {
  try {
    const nodes = await Node.find().sort({ createdAt: 1 });
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single node
router.get('/:id', async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
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
  const node = new Node({
    label: req.body.label,
    description: req.body.description,
    parent_id: req.body.parent_id,
    is_expanded: req.body.is_expanded,
  });

  try {
    const newNode = await node.save();
    res.status(201).json(newNode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a node
router.patch('/:id', async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    if (req.body.label) node.label = req.body.label;
    if (req.body.description !== undefined) node.description = req.body.description;
    if (req.body.parent_id !== undefined) node.parent_id = req.body.parent_id;
    if (req.body.is_expanded !== undefined) node.is_expanded = req.body.is_expanded;

    const updatedNode = await node.save();
    res.json(updatedNode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a node
router.delete('/:id', async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    await Node.deleteMany({ parent_id: req.params.id }); // Delete all children
    await node.deleteOne();
    res.json({ message: 'Node deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get children nodes
router.get('/:id/children', async (req, res) => {
  try {
    const children = await Node.find({ parent_id: req.params.id }).sort({ createdAt: 1 });
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});