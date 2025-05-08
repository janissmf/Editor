import { TreeNode, NodeAction } from '../types';
import { findNode, findParentNode, cloneTree, getNodePath } from '../utils/treeUtils';

export const treeReducer = (state: any, action: NodeAction) => {
  const newTree = cloneTree(state.tree);
  
  switch (action.type) {
    case 'INITIALIZE': {
      const { tree } = action;
      return {
        ...state,
        tree,
        rootNode: tree,
        currentPath: [{ id: tree.id, label: tree.label }],
        history: [tree],
        historyIndex: 0
      };
    }

    case 'ADD_ROOT': {
      const { node } = action;
      newTree.children = [...newTree.children, node];
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), newTree];
      
      return {
        ...state,
        tree: newTree,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    }

    case 'ADD_CHILD': {
      const { parentId, newNode } = action;
      const parentNode = findNode(newTree, parentId);
      
      if (parentNode) {
        parentNode.children.push(newNode);
        parentNode.isExpanded = true;

        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newTree];
        const updatedRootNode = findNode(newTree, state.rootNode.id);
        
        return {
          ...state,
          tree: newTree,
          rootNode: updatedRootNode || state.rootNode,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return state;
    }
    
    case 'EDIT_NODE': {
      const { id, label } = action;
      const node = findNode(newTree, id);
      
      if (node) {
        node.label = label;
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newTree];
        const updatedPath = state.currentPath.map((item: any) => 
          item.id === id ? { ...item, label } : item
        );
        const updatedRootNode = id === state.rootNode.id 
          ? { ...state.rootNode, label }
          : state.rootNode;
        
        return {
          ...state,
          tree: newTree,
          rootNode: updatedRootNode,
          currentPath: updatedPath,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return state;
    }

    case 'UPDATE_DESCRIPTION': {
      const { id, description } = action;
      const node = findNode(newTree, id);
      
      if (node) {
        node.description = description;
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newTree];
        const updatedRootNode = id === state.rootNode.id 
          ? { ...state.rootNode, description }
          : state.rootNode;
        
        return {
          ...state,
          tree: newTree,
          rootNode: updatedRootNode,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return state;
    }
    
    case 'DELETE_NODE': {
      const { id } = action;
      
      if (id === 'root') {
        return state;
      }
      
      const parentNode = findParentNode(newTree, id);
      
      if (parentNode) {
        parentNode.children = parentNode.children.filter(child => child.id !== id);
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), newTree];
        const shouldNavigateUp = id === state.rootNode.id;
        const newRootId = shouldNavigateUp ? parentNode.id : state.rootNode.id;
        const newRootNode = findNode(newTree, newRootId);
        const newPath = shouldNavigateUp 
          ? getNodePath(newTree, newRootId)?.map(node => ({ id: node.id, label: node.label }))
          : state.currentPath;
        
        return {
          ...state,
          tree: newTree,
          rootNode: newRootNode || state.rootNode,
          currentPath: newPath || state.currentPath,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return state;
    }
    
    case 'SET_ROOT': {
      const { id } = action;
      const node = findNode(newTree, id);
      
      if (node) {
        const path = getNodePath(newTree, id);
        if (path) {
          const currentPath = path.map(node => ({ id: node.id, label: node.label }));
          return {
            ...state,
            rootNode: node,
            currentPath
          };
        }
      }
      return state;
    }
    
    case 'RESTORE': {
      const { tree } = action;
      const rootNode = findNode(tree, state.rootNode.id) || tree;
      const path = getNodePath(tree, rootNode.id);
      const currentPath = path?.map(node => ({ id: node.id, label: node.label })) || 
        [{ id: tree.id, label: tree.label }];
      
      return {
        ...state,
        tree,
        rootNode,
        currentPath,
        historyIndex: state.historyIndex
      };
    }
    
    default:
      return state;
  }
};