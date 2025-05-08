import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, FileCode, List, ListOrdered, Heading1, Heading2, Heading3, Link2, Image, Table, Plus, Minus, Trash2, Palette } from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  insertCodeBlock: () => void;
  insertImage: () => void;
  insertTable: () => void;
  addColumnBefore?: () => void;
  addColumnAfter?: () => void;
  deleteColumn?: () => void;
  addRowBefore?: () => void;
  addRowAfter?: () => void;
  deleteRow?: () => void;
  deleteTable?: () => void;
}

const colors = [
  '#000000', // Black
  '#EF4444', // Red
  '#F59E0B', // Yellow
  '#10B981', // Green
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

const EditorToolbar: React.FC<EditorToolbarProps> = ({
                                                       editor,
                                                       insertCodeBlock,
                                                       insertImage,
                                                       insertTable,
                                                       addColumnBefore,
                                                       addColumnAfter,
                                                       deleteColumn,
                                                       addRowBefore,
                                                       addRowAfter,
                                                       deleteRow,
                                                       deleteTable,
                                                     }) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  if (!editor) {
    return null;
  }

  const isTableActive = editor.isActive('table');

  return (
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
          <div className="relative">
            <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Palette size={16} />
            </button>
            {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-50 grid grid-cols-4 gap-1">
                  {colors.map((color) => (
                      <button
                          key={color}
                          onClick={() => {
                            editor.chain().focus().setColor(color).run();
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: color }}
                      />
                  ))}
                </div>
            )}
          </div>
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
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
          >
            <Heading2 size={16} />
          </button>
          <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
          >
            <Heading3 size={16} />
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
              onClick={insertImage}
              className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  editor.isActive('image') ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
          >
            <Image size={16} />
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
  );
};

export default EditorToolbar;