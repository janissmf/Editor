import React from 'react';
import { TreeNode } from '../types';
import { Search, X } from 'lucide-react';
import { useTree } from '../context/TreeContext';

interface SearchResultsProps {
  onClose: () => void;
  onSelect: (node: TreeNode) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ onClose, onSelect }) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<TreeNode[]>([]);
  const { state, navigateTo } = useTree();

  const searchNodes = (node: TreeNode, searchQuery: string): TreeNode[] => {
    let matches: TreeNode[] = [];
    
    if (node.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      matches.push(node);
    }
    
    for (const child of node.children) {
      matches = [...matches, ...searchNodes(child, searchQuery)];
    }
    
    return matches;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);
    
    if (searchQuery.trim().length >= 2) {
      const searchResults = searchNodes(state.tree, searchQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const handleNodeClick = (node: TreeNode) => {
    navigateTo(node.id);
    onSelect(node);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search in descriptions..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className="w-full p-4 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <h3 className="font-medium mb-1">{node.label}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {node.description?.replace(/<[^>]*>/g, '') || 'No description'}
                  </p>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No results found
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
};