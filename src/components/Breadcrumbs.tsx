import React from 'react';
import { NodePath } from '../types';
import { useTree } from '../context/TreeContext';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  path: NodePath[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path }) => {
  const { navigateTo } = useTree();

  return (
    <nav className="flex items-center space-x-1 text-sm overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          <button
            onClick={() => navigateTo(item.id)}
            className={`
              px-2 py-1 rounded 
              ${index === path.length - 1 
                ? 'bg-blue-100 text-blue-800 font-medium dark:bg-blue-900 dark:text-blue-200' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }
              transition-colors whitespace-nowrap
            `}
          >
            {item.label}
          </button>
          
          {index < path.length - 1 && (
            <ChevronRight className="text-slate-400 dark:text-slate-500" size={14} />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;