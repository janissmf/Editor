import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'nodes.json');

// Initialize store with default root node if file doesn't exist
const defaultData = {
  nodes: [{
    _id: 'root',
    label: 'Root Node',
    description: 'Welcome to NodeTree! This is the root node of your tree.',
    parent_id: null,
    is_expanded: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }]
};

// Ensure data file exists
async function initializeStore() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

// Read all data
async function readStore() {
  await initializeStore();
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Write data
async function writeStore(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export const store = {
  initializeStore,
  
  // Get all nodes
  async getAllNodes() {
    const data = await readStore();
    return data.nodes;
  },

  // Get single node
  async getNode(id) {
    const data = await readStore();
    return data.nodes.find(node => node._id === id);
  },

  // Create node
  async createNode(nodeData) {
    const data = await readStore();
    
    const newNode = {
      ...nodeData,
      _id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.nodes.push(newNode);
    await writeStore(data);
    return newNode;
  },

  // Update node
  async updateNode(id, updates) {
    const data = await readStore();
    const nodeIndex = data.nodes.findIndex(node => node._id === id);
    
    if (nodeIndex === -1) {
      const error = new Error('Node not found');
      error.status = 404;
      throw error;
    }

    data.nodes[nodeIndex] = {
      ...data.nodes[nodeIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await writeStore(data);
    return data.nodes[nodeIndex];
  },

  // Delete node and its children
  async deleteNode(id) {
    const data = await readStore();
    const deleteIds = new Set();

    // Recursive function to collect all child IDs
    const collectChildIds = (nodeId) => {
      deleteIds.add(nodeId);
      data.nodes
        .filter(node => node.parent_id === nodeId)
        .forEach(child => collectChildIds(child._id));
    };

    collectChildIds(id);
    data.nodes = data.nodes.filter(node => !deleteIds.has(node._id));
    await writeStore(data);
  },

  // Get children nodes
  async getChildren(parentId) {
    const data = await readStore();
    return data.nodes
      .filter(node => node.parent_id === parentId)
      .sort((a, b) => a.label.localeCompare(b.label));
  }
};