import React, { createContext, useContext, useReducer, useState, ReactNode, useEffect, useCallback } from 'react';
import { TreeNode, NodeAction, NodePath } from '../types';
import { findNode, getNodePath } from '../utils/treeUtils';
import { api } from '../services/api';
import { buildTreeFromNodes } from '../utils/treeUtils';
import { treeReducer } from '../reducers/treeReducer';

// Initial tree structure
const initialRoot: TreeNode = {
  id: 'root',
  label: 'Root Node',
  description: 'Welcome to NodeTree! This is the root node of your tree. You can add child nodes, edit descriptions, and organize your thoughts hierarchically.',
  children: [],
  isExpanded: true
};

interface TreeState {
  tree: TreeNode;
  rootNode: TreeNode;
  currentPath: NodePath[];
  history: TreeNode[];
  historyIndex: number;
}

interface TreeContextProps {
  state: TreeState;
  dispatch: React.Dispatch<NodeAction>;
  addNode: (parentId: string | null, label: string) => Promise<TreeNode>;
  editNode: (id: string, label: string) => Promise<void>;
  updateDescription: (id: string, description: string) => Promise<void>;
  deleteNode: (id: string, parentId?: string) => Promise<void>;
  setRootNode: (id: string) => void;
  navigateUp: (steps?: number) => void;
  navigateTo: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

const TreeContext = createContext<TreeContextProps | undefined>(undefined);

export const TreeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialState = {
    tree: initialRoot,
    rootNode: initialRoot,
    currentPath: [{ id: 'root', label: 'Root Node' }],
    history: [initialRoot],
    historyIndex: 0
  };

  const [state, dispatch] = useReducer(treeReducer, initialState);
  const [descriptionUpdateTimeout, setDescriptionUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle URL-based navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const nodeId = pathParts[0];
      
      if (nodeId) {
        const node = findNode(state.tree, nodeId);
        if (node) {
          setRootNode(nodeId);
        }
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [state.tree]);

  // Load initial data
  useEffect(() => {
    let mounted = true;

    const loadNodes = async () => {
      try {
        setError(null);
        const nodes = await api.getNodes();
        
        if (mounted) {
          const tree = buildTreeFromNodes(nodes);
          dispatch({ type: 'INITIALIZE', tree });
        }
      } catch (error) {
        console.error('Error loading nodes:', error);
        if (mounted) {
          setError('Failed to load nodes. Using default tree.');
          dispatch({ type: 'INITIALIZE', tree: initialRoot });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNodes();

    return () => {
      mounted = false;
    };
  }, []);

  const addNode = useCallback(async (parentId: string | null, label: string): Promise<TreeNode> => {
    if (!label || label.trim() === '') {
      throw new Error('Label is required');
    }

    try {
      const parent_id = parentId === 'root' ? null : parentId;
      
      const newNodeData = {
        label: label.trim(),
        description: '',
        parent_id,
        is_expanded: true
      };

      const newNode = await api.createNode(newNodeData);
      
      const nodeToAdd = {
        id: newNode._id,
        label: newNode.label,
        description: newNode.description || '',
        children: [],
        isExpanded: newNode.is_expanded
      };

      if (!parentId || parentId === 'root') {
        dispatch({ type: 'ADD_ROOT', node: nodeToAdd });
      } else {
        dispatch({ type: 'ADD_CHILD', parentId, newNode: nodeToAdd });
      }

      // Refresh the tree
      const nodes = await api.getNodes();
      const updatedTree = buildTreeFromNodes(nodes);
      dispatch({ type: 'INITIALIZE', tree: updatedTree });

      return nodeToAdd;
    } catch (error) {
      console.error('Error adding node:', error);
      throw error;
    }
  }, [state.tree]);

  const editNode = useCallback(async (id: string, label: string) => {
    try {
      await api.updateNode(id, { label });
      
      const nodes = await api.getNodes();
      const updatedTree = buildTreeFromNodes(nodes);
      dispatch({ type: 'INITIALIZE', tree: updatedTree });
      
      if (id === state.rootNode.id) {
        const updatedNode = findNode(updatedTree, id);
        if (updatedNode) {
          dispatch({ type: 'SET_ROOT', id: updatedNode.id });
        }
      }
    } catch (error) {
      console.error('Error editing node:', error);
      throw error;
    }
  }, [state.rootNode.id]);

  const updateDescription = useCallback(async (id: string, description: string) => {
    dispatch({ type: 'UPDATE_DESCRIPTION', id, description });

    try {
      if (descriptionUpdateTimeout) {
        clearTimeout(descriptionUpdateTimeout);
      }

      const timeout = setTimeout(async () => {
        try {
          await api.updateNode(id, { description });
        } catch (error) {
          console.error('Error updating description:', error);
          const currentNode = findNode(state.tree, id);
          if (currentNode) {
            dispatch({ type: 'UPDATE_DESCRIPTION', id, description: currentNode.description || '' });
          }
          throw error;
        }
      }, 1000);

      setDescriptionUpdateTimeout(timeout);
    } catch (error) {
      console.error('Error in description update:', error);
      throw error;
    }
  }, [descriptionUpdateTimeout, state.tree]);

  const deleteNode = useCallback(async (id: string) => {
    if (id === 'root') return;

    try {
      await api.deleteNode(id);
      
      const nodes = await api.getNodes();
      const updatedTree = buildTreeFromNodes(nodes);
      dispatch({ type: 'INITIALIZE', tree: updatedTree });
    } catch (error) {
      console.error('Error deleting node:', error);
      throw error;
    }
  }, []);

  const setRootNode = useCallback((id: string) => {
    const node = findNode(state.tree, id);
    if (node) {
      const path = getNodePath(state.tree, id);
      if (path) {
        window.history.pushState({}, '', `/${id}`);
        dispatch({ type: 'SET_ROOT', id });
      }
    }
  }, [state.tree]);

  const navigateUp = useCallback((steps = 1) => {
    if (state.currentPath.length <= steps) {
      setRootNode('root');
    } else {
      const targetIndex = state.currentPath.length - 1 - steps;
      const targetId = state.currentPath[targetIndex].id;
      setRootNode(targetId);
    }
  }, [state.currentPath, setRootNode]);

  const navigateTo = useCallback((id: string) => {
    setRootNode(id);
  }, [setRootNode]);

  const undo = useCallback(() => {
    if (state.historyIndex > 0) {
      dispatch({ type: 'RESTORE', tree: state.history[state.historyIndex - 1] });
    }
  }, [state.historyIndex, state.history]);

  const redo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      dispatch({ type: 'RESTORE', tree: state.history[state.historyIndex + 1] });
    }
  }, [state.historyIndex, state.history]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('Using default tree due to error:', error);
  }

  return (
    <TreeContext.Provider 
      value={{ 
        state, 
        dispatch, 
        addNode, 
        editNode,
        updateDescription,
        deleteNode, 
        setRootNode,
        navigateUp,
        navigateTo,
        undo,
        redo
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};

export const useTree = () => {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
};