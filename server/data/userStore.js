import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize store with empty users array if file doesn't exist
const defaultData = {
  users: []
};

// Ensure users file exists
async function initializeStore() {
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify(defaultData, null, 2));
  }
}

// Read all data
async function readStore() {
  await initializeStore();
  const data = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

// Write data
async function writeStore(data) {
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

export const userStore = {
  async findByEmail(email) {
    const data = await readStore();
    return data.users.find(user => user.email === email);
  },

  async findById(id) {
    const data = await readStore();
    return data.users.find(user => user._id === id);
  },

  async createUser(userData) {
    const data = await readStore();
    const newUser = {
      _id: Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.users.push(newUser);
    await writeStore(data);
    return newUser;
  },

  async updateUser(id, updates) {
    const data = await readStore();
    const userIndex = data.users.findIndex(user => user._id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await writeStore(data);
    return data.users[userIndex];
  }
};