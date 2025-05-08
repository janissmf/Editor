import { TreeNode, NodePath } from '../types';

// Deep clone a tree
export const cloneTree = (tree: TreeNode): TreeNode => {
  return {
    ...tree,
    children: tree.children.map(child => cloneTree(child))
  };
};

// Find a node by ID in the tree
export const findNode = (tree: TreeNode, id: string): TreeNode | null => {
  if (tree.id === id) {
    return tree;
  }
  
  for (const child of tree.children) {
    const found = findNode(child, id);
    if (found) {
      return found;
    }
  }
  
  return null;
};

// Find the parent of a node by child ID
export const findParentNode = (tree: TreeNode, childId: string): TreeNode | null => {
  for (const child of tree.children) {
    if (child.id === childId) {
      return tree;
    }
    
    const found = findParentNode(child, childId);
    if (found) {
      return found;
    }
  }
  
  return null;
};

// Get the path from root to a specific node
export const getNodePath = (
  tree: TreeNode, 
  targetId: string, 
  path: TreeNode[] = []
): TreeNode[] | null => {
  // Start with the current node
  const newPath = [...path, tree];
  
  // If this is the target, return the path
  if (tree.id === targetId) {
    return newPath;
  }
  
  // Check children
  for (const child of tree.children) {
    const result = getNodePath(child, targetId, newPath);
    if (result) {
      return result;
    }
  }
  
  // Not found in this branch
  return null;
};

// Count total nodes in a tree
export const countNodes = (tree: TreeNode): number => {
  let count = 1; // Count the current node
  
  for (const child of tree.children) {
    count += countNodes(child);
  }
  
  return count;
};

// Get the maximum depth of the tree
export const getMaxDepth = (tree: TreeNode): number => {
  if (tree.children.length === 0) {
    return 1;
  }
  
  const childDepths = tree.children.map(child => getMaxDepth(child));
  return 1 + Math.max(...childDepths);
};

// Build tree from flat nodes array
export const buildTreeFromNodes = (nodes: any[]): TreeNode => {
  const initialRoot: TreeNode = {
    id: 'root',
    label: 'Root Node',
    description: 'Welcome to NodeTree! This is the root node of your tree.',
    children: [],
    isExpanded: true
  };

  if (!nodes || nodes.length === 0) return initialRoot;

  const nodeMap = new Map();
  
  // First pass: Create all nodes
  nodes.forEach(node => {
    nodeMap.set(node._id, {
      id: node._id,
      label: node.label,
      description: node.description || '',
      children: [],
      isExpanded: node.is_expanded ?? true
    });
  });

  // Second pass: Build tree structure
  nodes.forEach(node => {
    if (node.parent_id) {
      const parent = nodeMap.get(node.parent_id);
      if (parent) {
        parent.children.push(nodeMap.get(node._id));
      }
    }
  });

  // Find root nodes and add them to the tree
  const rootNodes = nodes.filter(node => !node.parent_id);
  const tree = {
    ...initialRoot,
    children: rootNodes.map(node => nodeMap.get(node._id))
  };

  return tree;
};