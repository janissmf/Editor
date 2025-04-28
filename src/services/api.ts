import axios from 'axios';
import { TreeNode } from '../types';

const API_URL = 'http://localhost:5001/api';

export const api = {
  // Get all nodes
  async getNodes() {
    const response = await axios.get(`${API_URL}/nodes`);
    return response.data;
  },

  // Get a single node by ID
  async getNode(id: string) {
    const response = await axios.get(`${API_URL}/nodes/${id}`);
    return response.data;
  },

  // Create a new node
  async createNode(node: Omit<TreeNode, 'id'>) {
    const response = await axios.post(`${API_URL}/nodes`, node);
    return response.data;
  },

  // Update a node
  async updateNode(id: string, updates: Partial<TreeNode>) {
    const response = await axios.patch(`${API_URL}/nodes/${id}`, updates);
    return response.data;
  },

  // Delete a node
  async deleteNode(id: string) {
    await axios.delete(`${API_URL}/nodes/${id}`);
  },

  // Get children nodes
  async getChildren(parentId: string) {
    const response = await axios.get(`${API_URL}/nodes/${parentId}/children`);
    return response.data;
  }
};