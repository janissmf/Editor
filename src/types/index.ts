export interface TreeNode {
  id: string;
  label: string;
  description?: string;
  children: TreeNode[];
  isExpanded?: boolean;
}

export interface NodePath {
  id: string;
  label: string;
}

export type NodeAction = 
  | { type: 'ADD_CHILD'; parentId: string; newNode: TreeNode }
  | { type: 'EDIT_NODE'; id: string; label: string }
  | { type: 'UPDATE_DESCRIPTION'; id: string; description: string }
  | { type: 'DELETE_NODE'; id: string; parentId?: string }
  | { type: 'TOGGLE_EXPAND'; id: string }
  | { type: 'SET_ROOT'; id: string }
  | { type: 'RESTORE'; tree: TreeNode };