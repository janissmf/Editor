import React, { useState } from 'react';
import { TreeNode as TreeNodeType } from '../types';
import { useTree } from '../context/TreeContext';
import { ChevronRight, ChevronDown, Edit2, Trash2, PlusCircle } from 'lucide-react';

interface NodeProps {
  node: TreeNodeType;
  depth?: number;
  onSelect?: (node: TreeNodeType) => void;
  isSelected?: boolean;
  activeNodeId?: string;
}

const Node: React.FC<NodeProps> = ({ node, depth = 0, onSelect, isSelected, activeNodeId }) => {
  const { editNode, deleteNode, addNode } = useTree();
  const [isExpanded, setIsExpanded] = useState(!!node.isExpanded);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (node.children.length > 0) {
      alert('Cannot delete a node that has children. Please delete all child nodes first.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${node.label}"?`)) {
      deleteNode(node.id);
    }
  };

  const handleAddChild = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const label = prompt('Enter node name:');
    if (label) {
      const newNode = await addNode(node.id, label);
      setIsExpanded(true);
      if (onSelect && newNode) {
        onSelect(newNode);
      }
    }
  };

  const handleNodeClick = () => {
    if (onSelect) {
      onSelect(node);
    }
  };

  const hasChildren = node.children.length > 0;
  const isNodeSelected = node.id === activeNodeId;

  return (
    <div className="transition-all duration-200">
      <div 
        className={`
          relative group flex items-center p-2 rounded-md cursor-pointer
          ${isNodeSelected 
            ? 'bg-blue-900/40 ring-2 ring-blue-500'
            : 'hover:bg-slate-800/50'
          }
          transition-all duration-200 ease-in-out
        `}
        onClick={handleNodeClick}
      >
        {hasChildren && (
          <button 
            onClick={handleToggleExpand}
            className="mr-2 text-slate-400 hover:text-slate-200"
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
        
        {!hasChildren && <div className="w-6 mr-2"></div>}
        
        <span className={`flex-1 ${isNodeSelected ? 'text-blue-300' : 'text-slate-300'}`}>
          {node.label}
        </span>
        
        <div className="flex items-center space-x-1">
          <div className={`flex space-x-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
            <button 
              onClick={handleAddChild}
              className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-900/50"
              title="Add child"
            >
              <PlusCircle size={16} />
            </button>
            <button 
              onClick={handleEdit}
              className="p-1.5 rounded-md text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/50"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={handleDelete}
              className={`p-1.5 rounded-md ${
                hasChildren 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-400 hover:text-red-300 hover:bg-red-900/50'
              }`}
              title={hasChildren ? 'Cannot delete node with children' : 'Delete'}
              disabled={hasChildren}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className={`pl-8 mt-2 ${depth === 0 ? 'ml-4' : ''} border-l-2 border-slate-700`}>
          {node.children.map(child => (
            <div key={child.id} className="mt-2">
              <Node 
                node={child} 
                depth={depth + 1} 
                onSelect={onSelect}
                isSelected={child.id === activeNodeId}
                activeNodeId={activeNodeId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Node;