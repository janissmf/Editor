import React, { useState, useCallback } from 'react';
import { useTree } from '../context/TreeContext';
import Node from './Node';
import Breadcrumbs from './Breadcrumbs';
import { PlusCircle, Undo2, Redo2, Home, Users, Calendar, Clock, GripVertical, Bold, Italic, Underline, Code, List, ListOrdered, Heading1, Link2, Table, FileCode, Trash2, Plus, Minus, Eye, Edit, X, Maximize2, Minimize2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import TableExtension from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { TreeNode as TreeNodeType } from '../types';

const lowlight = createLowlight(common);

const NodeTree: React.FC = () => {
  const { state, addNode, navigateUp, undo, redo, updateDescription } = useTree();
  const { rootNode, currentPath } = state;
  const [detailsWidth, setDetailsWidth] = useState(() => {
    // Set initial width to 80% of viewport width
    return Math.min(window.innerWidth * 0.6, 1200);
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeNodeType | null>(null);

  // Update details width when window resizes
  React.useEffect(() => {
    const handleResize = () => {
      if (!isResizing) {
        setDetailsWidth(Math.min(window.innerWidth * 0.8, 1200));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isResizing]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      UnderlineExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Add a description...',
      }),
      TableExtension.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block-with-line-numbers',
          spellcheck: 'false',
          autocorrect: 'off',
          autocapitalize: 'off',
        },
      }),
    ],
    content: rootNode.description || '',
    onUpdate: ({ editor }) => {
      updateDescription(rootNode.id, editor.getHTML());
    },
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
    editable: isEditing,
  });

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertCodeBlock = () => {
    editor?.chain().focus().setCodeBlock().run();
  };

  const addColumnBefore = () => {
    editor?.chain().focus().addColumnBefore().run();
  };

  const addColumnAfter = () => {
    editor?.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor?.chain().focus().deleteColumn().run();
  };

  const addRowBefore = () => {
    editor?.chain().focus().addRowBefore().run();
  };

  const addRowAfter = () => {
    editor?.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor?.chain().focus().deleteRow().run();
  };

  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
  };

  const handleAddRootChild = () => {
    const label = prompt('Enter node name:');
    if (label) {
      addNode(rootNode.id, label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      redo();
    }
  };

  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const container = document.getElementById('main-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        setDetailsWidth(Math.min(Math.max(250, newWidth), window.innerWidth * 0.8));
      }
    }
  }, [isResizing]);

  const handleNodeSelect = (node: TreeNodeType) => {
    setSelectedNode(node);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedNode(null);
    setIsFullScreen(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Detect screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowDetails(false);
        setIsFullScreen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
      };
    }
  }, [isResizing, resize, stopResizing]);

  React.useEffect(() => {
    if (editor && rootNode.description !== editor.getHTML()) {
      editor.commands.setContent(rootNode.description || '');
    }
  }, [rootNode.id, rootNode.description, editor]);

  React.useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  const isTableActive = editor?.isActive('table');

  const renderDetailsContent = () => (
    <>
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">{rootNode.label}</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-md transition-colors ${
              isEditing 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
            }`}
          >
            {isEditing ? <Eye size={16} /> : <Edit size={16} />}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {!isMobile && (
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          )}
          <button
            onClick={closeDetails}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {editor && (
          <div className="space-y-4">
            {isEditing && (
              <>
                <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700' : ''
                    }`}
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700' : ''
                    }`}
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      editor.isActive('underline') ? 'bg-slate-200 dark:bg-slate-700' : ''
                    }`}
                  >
                    <Underline size={16} />
                  </button>
                  <button
                    onClick={insertCodeBlock}
                    className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      editor.isActive('codeBlock') ? 'bg-slate-200 dark:bg-slate-700' : ''
                    }`}
                  >
                    <FileCode size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-700' : ''
                    }`}
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-700' : ''
                    }`}
                  >
                    <ListOrdered size={16} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 dark:bg-slate-700' : ''
                    }`}
                  >
                    <Heading1 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const url = window.prompt('Enter the URL');
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                      }
                    }}
                    className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      editor.isActive('link') ? 'bg-slate-200 dark:bg-slate-700' : ''
                    }`}
                  >
                    <Link2 size={16} />
                  </button>
                  <button
                    onClick={insertTable}
                    className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      editor.isActive('table') ? 'bg-slate-200 dark:bg-slate-700' : ''
                    }`}
                  >
                    <Table size={16} />
                  </button>
                </div>

                {isTableActive && (
                  <div className="flex flex-wrap gap-2 py-2 px-1 bg-slate-50 dark:bg-slate-700/50 rounded-md mb-2">
                    <button
                      onClick={addColumnBefore}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      title="Add column before"
                    >
                      <Plus size={14} className="rotate-90" />
                    </button>
                    <button
                      onClick={addColumnAfter}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      title="Add column after"
                    >
                      <Plus size={14} className="rotate-90" />
                    </button>
                    <button
                      onClick={deleteColumn}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      title="Delete column"
                    >
                      <Minus size={14} className="rotate-90" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                    <button
                      onClick={addRowBefore}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      title="Add row before"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={addRowAfter}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      title="Add row after"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={deleteRow}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      title="Delete row"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                    <button
                      onClick={deleteTable}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-red-500 hover:text-red-600"
                      title="Delete table"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
            <EditorContent 
              editor={editor} 
              className={`prose prose-sm dark:prose-invert max-w-none min-h-[200px] focus:outline-none ${
                !isEditing ? 'cursor-default select-text' : ''
              }`}
            />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div 
      className="w-full h-full flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-100"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <header className="bg-white dark:bg-slate-800 shadow py-4 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">NodeTree</h1>
          <span className="text-sm text-slate-500 dark:text-slate-400">Interactive Tree Editor</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigateUp(currentPath.length - 1)} 
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Go to root"
          >
            <Home size={18} />
          </button>
          <button 
            onClick={undo} 
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button 
            onClick={redo} 
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>
      </header>
      
      <div id="main-container" className="flex-1 p-6 flex gap-6 relative">
        <div className={`flex-1 overflow-auto min-w-0 ${isFullScreen ? 'hidden' : ''}`}>
          <Breadcrumbs path={currentPath} />
          
          <div className="mt-8 transition-all">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-semibold">{rootNode.label}</h2>
              <button 
                onClick={handleAddRootChild}
                className="ml-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                title="Add child node"
              >
                <PlusCircle size={16} />
              </button>
            </div>
            
            <div className="mt-6 space-y-4">
              {rootNode.children.map(child => (
                <Node key={child.id} node={child} onSelect={handleNodeSelect} />
              ))}
              
              {rootNode.children.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                  <p className="text-slate-500 dark:text-slate-400">No children nodes. Add a new node to get started.</p>
                  <button 
                    onClick={handleAddRootChild} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add First Node
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        {showDetails && (
          <>
            {/* Desktop Full Screen */}
            {!isMobile && isFullScreen ? (
              <div className="fixed inset-0 z-50 bg-white dark:bg-slate-800 flex flex-col">
                {renderDetailsContent()}
              </div>
            ) : null}

            {/* Desktop Sidebar */}
            {!isMobile && !isFullScreen ? (
              <>
                <div
                  className="absolute top-0 bottom-0 w-6 cursor-col-resize flex items-center justify-center -mx-3 group"
                  onMouseDown={startResizing}
                  style={{ right: `${detailsWidth + 24}px` }}
                >
                  <div className="w-1 h-16 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:bg-blue-400 dark:group-hover:bg-blue-500 transition-colors" />
                  <GripVertical 
                    size={16} 
                    className="absolute text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" 
                  />
                </div>

                <div 
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col"
                  style={{ width: detailsWidth }}
                >
                  {renderDetailsContent()}
                </div>
              </>
            ) : null}

            {/* Mobile Dialog */}
            {isMobile ? (
              <div className="fixed inset-0 z-50">
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={closeDetails}
                />
                <div className="absolute inset-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col">
                  {renderDetailsContent()}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default NodeTree;