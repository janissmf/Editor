import axios from 'axios';
import { TreeNode } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  async getNodes() {
    const response = await axiosInstance.get('/nodes');
    return response.data;
  },

  async getNode(id: string) {
    const response = await axiosInstance.get(`/nodes/${id}`);
    return response.data;
  },

  async createNode(node: Omit<TreeNode, 'id'>) {
    const response = await axiosInstance.post('/nodes', node);
    return response.data;
  },

  async updateNode(id: string, updates: Partial<TreeNode>) {
    const response = await axiosInstance.patch(`/nodes/${id}`, updates);
    return response.data;
  },

  async deleteNode(id: string) {
    await axiosInstance.delete(`/nodes/${id}`);
  },

  async getChildren(parentId: string) {
    const response = await axiosInstance.get(`/nodes/${parentId}/children`);
    return response.data;
  }
};