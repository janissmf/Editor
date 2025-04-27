import React, { useState } from 'react';
import { TreeNode as TreeNodeType } from '../types';
import { useTree } from '../context/TreeContext';
import { ChevronRight, ChevronDown, Edit2, Trash2, PlusCircle, FileText } from 'lucide-react';

interface NodeProps {
  node: TreeNodeType;
  depth?: number;
  onSelect?: (node: TreeNodeType) => void;
}

const Node: React.FC<NodeProps> = ({ node, depth = 0, onSelect }) => {
  const { editNode, deleteNode, setRootNode, addNode } = useTree();
  const [isExpanded, setIsExpanded] = useState(!!node.isExpanded);
  const [showActions, setShowActions] = useState(false);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLabel = prompt('Edit node name:', node.label);
    if (newLabel) {
      editNode(node.id, newLabel);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${node.label}" and all its children?`)) {
      deleteNode(node.id);
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const label = prompt('Enter node name:');
    if (label) {
      addNode(node.id, label);
      setIsExpanded(true);
    }
  };

  const handleNodeClick = () => {
    setRootNode(node.id);
    if (onSelect) {
      onSelect(node);
    }
  };

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(node);
    }
  };

  const hasChildren = node.children.length > 0;

  return (
    <div className="transition-all duration-200">
      <div 
        className={`
          relative group flex items-center p-2 rounded-md 
          ${depth === 0 ? 'bg-white dark:bg-slate-800 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-700'} 
          transition-colors cursor-pointer
        `}
        onClick={handleNodeClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {hasChildren && (
          <button 
            onClick={handleToggleExpand}
            className="mr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
        
        {!hasChildren && <div className="w-6 mr-2"></div>}
        
        <span className="flex-1">{node.label}</span>
        
        <div className={`flex space-x-1 ${showActions ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
          <button
            onClick={handleDescriptionClick}
            className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 md:hidden"
            title="View description"
          >
            <FileText size={16} />
          </button>
          <button 
            onClick={handleAddChild}
            className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title="Add child"
          >
            <PlusCircle size={16} />
          </button>
          <button 
            onClick={handleEdit}
            className="p-1 text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className={`pl-8 mt-2 ${depth === 0 ? 'ml-4' : ''} border-l-2 border-slate-200 dark:border-slate-700`}>
          {node.children.map(child => (
            <div key={child.id} className="mt-2">
              <Node node={child} depth={depth + 1} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Node;