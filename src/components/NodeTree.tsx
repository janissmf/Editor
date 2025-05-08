import React, { useState, useCallback, useEffect } from 'react';
import { useTree } from '../context/TreeContext';
import Node from './Node';
import EditorToolbar from './EditorToolbar'
import { SearchResults } from './SearchResults';
import {
    PlusCircle,
    Undo2,
    Redo2,
    Trash2,
    Eye,
    Edit,
    X,
    Search,
    ChevronLeft,
    Edit2,
    LogOut
} from 'lucide-react';
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
import TiptapImage from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { common, createLowlight } from 'lowlight';
import { TreeNode as TreeNodeType } from '../types';
import { findNode } from '../utils/treeUtils';
import { api } from '../services/api';
import { buildTreeFromNodes } from '../utils/treeUtils';

const lowlight = createLowlight(common);

const NodeTree: React.FC = () => {
    const { state, addNode, undo, redo, updateDescription, editNode, deleteNode, dispatch, setRootNode } = useTree();
    const [detailsWidth, setDetailsWidth] = useState(() => Math.floor(window.innerWidth * 0.6));
    const [isResizing, setIsResizing] = useState(false);
    const [isEditing, setIsEditing] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedNode, setSelectedNode] = useState<TreeNodeType | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [showRootView, setShowRootView] = useState(true);
    const [activeNode, setActiveNode] = useState<TreeNodeType | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showMobileDescription, setShowMobileDescription] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (!isMobile) {
                setDetailsWidth(Math.floor(window.innerWidth * 0.6));
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    useEffect(() => {
        const handleUrlChange = () => {
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const nodeId = pathParts[0];

            if (nodeId) {
                const node = findNode(state.tree, nodeId);
                if (node) {
                    setSelectedNode(node);
                    setShowRootView(false);
                    setRootNode(nodeId);
                }
            } else {
                setShowRootView(true);
                setSelectedNode(null);
            }
        };

        handleUrlChange();
        window.addEventListener('popstate', handleUrlChange);
        return () => window.removeEventListener('popstate', handleUrlChange);
    }, [state.tree, setRootNode, setSelectedNode, setShowRootView]);

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
            TiptapImage.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full',
                },
            }),
            TextStyle,
            Color,
        ],
        content: activeNode?.description || '',
        onUpdate: ({ editor }) => {
            if (activeNode) {
                updateDescription(activeNode.id, editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                spellcheck: 'false',
            },
        },
        editable: isEditing,
    });

    useEffect(() => {
        if (editor && activeNode) {
            editor.commands.setContent(activeNode.description || '');
        }
    }, [activeNode, editor]);

    const insertTable = () => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const insertCodeBlock = () => {
        editor?.chain().focus().setCodeBlock().run();
    };

    const insertImage = () => {
        const url = window.prompt('Enter the image URL:');
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
        }
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
        if (isResizing && !isMobile) {
            const newWidth = window.innerWidth - e.clientX;
            setDetailsWidth(Math.min(Math.max(300, newWidth), window.innerWidth * 0.8));
        }
    }, [isResizing, isMobile]);

    useEffect(() => {
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
        if (editor) {
            editor.setEditable(isEditing);
        }
    }, [isEditing, editor]);


    const handleNodeSelect = (node: TreeNodeType) => {
        setSelectedNode(node);
        setShowDetails(true);
        setActiveNode(node);
        if (showRootView) {
            setShowRootView(false);
        }
        window.history.pushState({}, '', `/${node.id}`);
    };

    const handleBackToRoots = () => {
        setShowRootView(true);
        setShowDetails(false);
        setSelectedNode(null);
        setActiveNode(null);
        window.history.pushState({}, '', '/');
    };

    const handleAddRootNode = async () => {
        const label = prompt('Enter root node name:');
        if (label) {
            await addNode(null, label);
            setShowRootView(true);
        }
    };

    const handleEditRootNode = async (node: TreeNodeType) => {
        const newLabel = prompt('Edit node name:', node.label);
        if (newLabel && newLabel !== node.label) {
            try {
                await editNode(node.id, newLabel);
            } catch (error) {
                console.error('Error editing root node:', error);
            }
        }
    };

    const handleDeleteRootNode = async (node: TreeNodeType) => {
        if (node.children.length > 0) {
            alert('Cannot delete a root node that has children');
            return;
        }

        if (confirm(`Are you sure you want to delete "${node.label}"?`)) {
            try {
                await deleteNode(node.id);
                const nodes = await api.getNodes();
                const updatedTree = buildTreeFromNodes(nodes);
                dispatch({ type: 'INITIALIZE', tree: updatedTree });
            } catch (error) {
                console.error('Error deleting root node:', error);
                alert('Failed to delete node. Please try again.');
            }
        }
    };

    const renderDetailsContent = () => (
        <>
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{activeNode?.label}</h3>
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
                <button
                    onClick={() => {
                        setShowDetails(false);
                        setActiveNode(null);
                    }}
                    className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {editor && (
                    <div className="space-y-4">
                        {isEditing && (
                            <EditorToolbar
                                editor={editor}
                                insertCodeBlock={insertCodeBlock}
                                insertImage={insertImage}
                                insertTable={insertTable}
                                addColumnBefore={addColumnBefore}
                                addColumnAfter={addColumnAfter}
                                deleteColumn={deleteColumn}
                                addRowBefore={addRowBefore}
                                addRowAfter={addRowAfter}
                                deleteRow={deleteRow}
                                deleteTable={deleteTable}
                            />

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

    const renderMobileDescription = () => (
        <div className="fixed inset-0 z-50 bg-background">
            <div className="flex flex-col h-full">
                <div className="sticky top-0 z-10 bg-background p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-foreground">{activeNode?.label}</h3>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`p-2 rounded-md transition-colors ${
                                isEditing
                                    ? 'bg-blue-900/30 text-blue-400'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {isEditing ? <Eye size={16} /> : <Edit size={16} />}
                        </button>
                    </div>
                    <button
                        onClick={() => setShowMobileDescription(false)}
                        className="p-2 rounded-md hover:bg-muted"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {editor && (
                        <div className="space-y-4">
                            {isEditing && (
                                <EditorToolbar
                                    editor={editor}
                                    insertCodeBlock={insertCodeBlock}
                                    insertImage={insertImage}
                                    insertTable={insertTable}
                                    addColumnBefore={addColumnBefore}
                                    addColumnAfter={addColumnAfter}
                                    deleteColumn={deleteColumn}
                                    addRowBefore={addRowBefore}
                                    addRowAfter={addRowAfter}
                                    deleteRow={deleteRow}
                                    deleteTable={deleteTable}
                                />
                            )}
                            <EditorContent
                                editor={editor}
                                className={`prose prose-invert max-w-none min-h-[200px] focus:outline-none ${
                                    !isEditing ? 'cursor-default select-text' : ''
                                }`}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderNodeTree = () => (
        <div className="flex gap-6">
            <div className="flex-1 min-w-0">
                <div className="flex items-center mb-4 space-x-4">
                    <button
                        onClick={handleBackToRoots}
                        className="flex items-center text-foreground hover:text-blue-400"
                    >
                        <ChevronLeft size={20} />
                        <span>Back to Roots</span>
                    </button>
                    <h2 className="text-2xl font-semibold text-foreground">{selectedNode?.label}</h2>
                </div>
                <Node
                    node={selectedNode!}
                    onSelect={(node) => {
                        setActiveNode(node);
                        if (isMobile) {
                            setShowMobileDescription(true);
                        } else {
                            setShowDetails(true);
                        }
                    }}
                    isSelected={selectedNode?.id === activeNode?.id}
                    activeNodeId={activeNode?.id}
                />
            </div>

            {showDetails && activeNode && !isMobile && (
                <div
                    className="relative flex"
                    style={{ width: detailsWidth }}
                >
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize bg-border hover:bg-blue-500 transition-colors"
                        onMouseDown={startResizing}
                    />
                    <div className="flex-1 bg-background rounded-lg shadow-lg overflow-hidden flex flex-col">
                        {renderDetailsContent()}
                    </div>
                </div>
            )}
        </div>
    );

    const renderRootCards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.tree.children.map((node) => (
                <div
                    key={node.id}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                    <div className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => handleNodeSelect(node)}
                                className="text-xl font-semibold hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-left"
                            >
                                {node.label}
                            </button>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleEditRootNode(node)}
                                    className="p-1.5 rounded-md text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/30"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                {node.children.length === 0 && (
                                    <button
                                        onClick={() => handleDeleteRootNode(node)}
                                        className="p-1.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex-1" />
                        <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {node.children.length} {node.children.length === 1 ? 'child' : 'children'}
              </span>
                            <button
                                onClick={() => addNode(node.id, 'New Node')}
                                className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1"
                            >
                                <PlusCircle size={16} />
                                <span>Add Child</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={handleAddRootNode}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
            >
                <PlusCircle size={24} />
                <span>Add New Root Node</span>
            </button>
        </div>
    );

    function logOut() {
        const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== 'false';
        if (authEnabled) {
            google.accounts.id.revoke(localStorage.getItem('email') || '', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('email');
                window.location.href = '/login';
            });
        }
    }

    return (
        <div
            className="w-full h-full flex flex-col min-h-screen bg-background text-foreground"
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <header className="bg-background shadow py-4 px-6 flex items-center justify-between border-b border-border">
                <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold text-blue-400">NodeTree</h1>
                    <span className="text-sm text-muted-foreground">Interactive Tree Editor</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowSearch(true)}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                        title="Search">
                        <Search size={18} />
                    </button>
                    <button
                        onClick={undo}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                        title="Undo" >
                        <Undo2 size={18} />
                    </button>
                    <button
                        onClick={redo}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                        title="Redo" >
                        <Redo2 size={18} />
                    </button>
                    {import.meta.env.VITE_AUTH_ENABLED !== 'false' && (
                        <button
                            onClick={logOut}
                            className="p-2 rounded-md hover:bg-muted transition-colors"
                            title="LogOut"
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </header>

            {showSearch && <SearchResults onClose={() => setShowSearch(false)} onSelect={handleNodeSelect} />}
            {showMobileDescription && activeNode && isMobile && renderMobileDescription()}

            <div id="main-container" className="flex-1 p-6 bg-background">
                {showRootView ? renderRootCards() : renderNodeTree()}
            </div>
        </div>
    );
};

export default NodeTree;