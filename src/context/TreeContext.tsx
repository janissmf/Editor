import React, { createContext, useContext, useReducer, useState, ReactNode, useEffect } from 'react';
import { TreeNode, NodeAction, NodePath } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { treeReducer } from '../reducers/treeReducer';
import { findNode, getNodePath } from '../utils/treeUtils';

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
  addNode: (parentId: string, label: string) => void;
  editNode: (id: string, label: string) => void;
  updateDescription: (id: string, description: string) => void;
  deleteNode: (id: string, parentId?: string) => void;
  setRootNode: (id: string) => void;
  navigateUp: (steps?: number) => void;
  navigateTo: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

const TreeContext = createContext<TreeContextProps | undefined>(undefined);

export const TreeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved tree from localStorage or use initial tree
  const savedTree = localStorage.getItem('nodeTree');
  const initialState = {
    tree: savedTree ? JSON.parse(savedTree) : initialRoot,
    rootNode: savedTree ? JSON.parse(savedTree) : initialRoot,
    currentPath: [{ id: 'root', label: 'Root Node' }],
    history: [savedTree ? JSON.parse(savedTree) : initialRoot],
    historyIndex: 0
  };

  const [state, dispatch] = useReducer(treeReducer, initialState);

  useEffect(() => {
    // Save to localStorage whenever the tree changes
    localStorage.setItem('nodeTree', JSON.stringify(state.tree));
  }, [state.tree]);

  const addNode = (parentId: string, label: string) => {
    const newNode: TreeNode = {
      id: uuidv4(),
      label,
      description: '',
      children: [],
      isExpanded: true
    };
    
    dispatch({ type: 'ADD_CHILD', parentId, newNode });

    // Update rootNode if we're adding to the current root
    if (parentId === state.rootNode.id) {
      const updatedRootNode = findNode(state.tree, state.rootNode.id);
      if (updatedRootNode) {
        dispatch({ type: 'SET_ROOT', id: updatedRootNode.id });
      }
    }
  };

  const editNode = (id: string, label: string) => {
    dispatch({ type: 'EDIT_NODE', id, label });
  };

  const updateDescription = (id: string, description: string) => {
    dispatch({ type: 'UPDATE_DESCRIPTION', id, description });
  };

  const deleteNode = (id: string, parentId?: string) => {
    dispatch({ type: 'DELETE_NODE', id, parentId });
  };

  const setRootNode = (id: string) => {
    const node = findNode(state.tree, id);
    if (node) {
      const path = getNodePath(state.tree, id);
      if (path) {
        const currentPath = path.map(node => ({ id: node.id, label: node.label }));
        dispatch({ type: 'SET_ROOT', id });
      }
    }
  };

  const navigateUp = (steps = 1) => {
    if (state.currentPath.length <= steps) {
      // Navigate to the absolute root
      setRootNode('root');
    } else {
      // Navigate up by the specified number of steps
      const targetIndex = state.currentPath.length - 1 - steps;
      const targetId = state.currentPath[targetIndex].id;
      setRootNode(targetId);
    }
  };

  const navigateTo = (id: string) => {
    setRootNode(id);
  };

  const undo = () => {
    if (state.historyIndex > 0) {
      const prevIndex = state.historyIndex - 1;
      const prevTree = state.history[prevIndex];
      dispatch({ type: 'RESTORE', tree: prevTree });
    }
  };

  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      const nextIndex = state.historyIndex + 1;
      const nextTree = state.history[nextIndex];
      dispatch({ type: 'RESTORE', tree: nextTree });
    }
  };

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