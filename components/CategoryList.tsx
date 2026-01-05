'use client';

import React, { useState } from 'react';
import { Plus, Tag, BookOpen, ChevronRight, Pencil, Trash2, FileJson, Info, X, CopyIcon } from 'lucide-react';
import { Select, MenuItem, FormControl } from '@mui/material';
import { LearningState, Topic, SubTopic } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface CategoryListProps {
  state: LearningState;
  onAddItem: (catId: string, name: string, desc: string, topics: Topic[]) => Promise<string | null>;
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onMoveItem: (itemId: string, catId: string) => void;
  onSelectItem: (id: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ state, onAddItem, onAddCategory, onUpdateCategory, onDeleteCategory, onMoveItem, onSelectItem }) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('bg-blue-500');
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState('bg-blue-500');
  const [draggedOverCatId, setDraggedOverCatId] = useState<string | null>(null);
  const [isJsonImportMode, setIsJsonImportMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showJsonInfo, setShowJsonInfo] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 
    'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-teal-500'
  ];

  const exampleJsonFormat = {
    name: "Master React Development",
    description: "Complete guide to becoming a React expert",
    topics: [
      {
        id: "topic-1",
        title: "React Fundamentals",
        isCompleted: false,
        deadline: "2024-12-31",
        notes: "Focus on hooks and components",
        subTopics: [
          {
            id: "subtopic-1",
            title: "Learn JSX syntax",
            isCompleted: false,
            notes: "Practice with simple components"
          },
          {
            id: "subtopic-2",
            title: "Understand Props and State",
            isCompleted: false
          }
        ]
      },
      {
        id: "topic-2",
        title: "Advanced React",
        isCompleted: false,
        subTopics: [
          {
            id: "subtopic-3",
            title: "Context API",
            isCompleted: false
          }
        ]
      }
    ],
    status: "Not started",
    comments: "Optional comments about the goal"
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !selectedCatId) return;

    const description = newItemDescription || `My personal goal: ${newItemName}`;
    onAddItem(selectedCatId, newItemName, description, []);
    setNewItemName('');
    setNewItemDescription('');
    setIsAddingItem(false);
    setIsJsonImportMode(false);
    setJsonText('');
    setJsonError(null);
  };

  const handleJsonImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonText.trim() || !selectedCatId) return;

    try {
      const parsed = JSON.parse(jsonText);
      
      // Validate required fields
      if (!parsed.name || typeof parsed.name !== 'string') {
        throw new Error('Missing or invalid "name" field');
      }

      // Validate and process topics
      const topics: Topic[] = [];
      if (parsed.topics && Array.isArray(parsed.topics)) {
        parsed.topics.forEach((topic: any, index: number) => {
          if (!topic.title || typeof topic.title !== 'string') {
            throw new Error(`Topic ${index + 1} is missing or has invalid "title"`);
          }

          const processedTopic: Topic = {
            id: topic.id || `topic-${Date.now()}-${index}`,
            title: topic.title,
            isCompleted: topic.isCompleted === true,
            subTopics: [],
            deadline: topic.deadline || undefined,
            notes: topic.notes || undefined
          };

          // Process subTopics
          if (topic.subTopics && Array.isArray(topic.subTopics)) {
            processedTopic.subTopics = topic.subTopics.map((subTopic: any, subIndex: number) => {
              if (!subTopic.title || typeof subTopic.title !== 'string') {
                throw new Error(`SubTopic ${subIndex + 1} in Topic "${topic.title}" is missing or has invalid "title"`);
              }
              return {
                id: subTopic.id || `subtopic-${Date.now()}-${index}-${subIndex}`,
                title: subTopic.title,
                isCompleted: subTopic.isCompleted === true,
                notes: subTopic.notes || undefined
              } as SubTopic;
            });
          }

          topics.push(processedTopic);
        });
      }

      const description = parsed.description || `My personal goal: ${parsed.name}`;
      
      // Create the item
      onAddItem(selectedCatId, parsed.name, description, topics);
      
      // Reset form
      setJsonText('');
      setJsonError(null);
      setIsJsonImportMode(false);
      setIsAddingItem(false);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setJsonError('Invalid JSON format. Please check your JSON syntax.');
      } else if (error instanceof Error) {
        setJsonError(error.message);
      } else {
        setJsonError('An error occurred while parsing the JSON.');
      }
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    onAddCategory(newCatName, newCatColor);
    setNewCatName('');
    setNewCatColor('bg-blue-500');
    setIsAddingCategory(false);
  };

  const handleStartEditCategory = (cat: { id: string; name: string; color: string }) => {
    setEditingCategoryId(cat.id);
    setEditCatName(cat.name);
    setEditCatColor(cat.color);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCatName || !editingCategoryId) return;
    onUpdateCategory(editingCategoryId, editCatName, editCatColor);
    setEditingCategoryId(null);
    setEditCatName('');
    setEditCatColor('bg-blue-500');
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const itemsInCategory = state.items.filter(i => i.categoryId === id);
    if (itemsInCategory.length > 0) {
      showAlert({
        type: 'warning',
        title: 'Cannot Delete Category',
        message: `Cannot delete category "${name}" because it contains ${itemsInCategory.length} goal(s). Please move or delete the goals first.`
      });
      return;
    }
    showConfirm({
      type: 'warning',
      title: 'Delete Category?',
      message: `Are you sure you want to delete the category "${name}"? This action cannot be undone.`,
      onConfirm: () => onDeleteCategory(id),
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('itemId', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    setDraggedOverCatId(null);
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId) {
      onMoveItem(itemId, catId);
    }
  };

  const handleDragOver = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    setDraggedOverCatId(catId);
  };

  const handleDragLeave = () => {
    setDraggedOverCatId(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Paths</h1>
          <p className="text-gray-500 dark:text-gray-400">Organize your journey. Drag & drop goals between categories.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium transition-all"
          >
            <Plus size={18} />
            <span>Category</span>
          </button>
          <button 
            onClick={() => {
              if (state.categories.length > 0) {
                setSelectedCatId(state.categories[0].id);
                setIsAddingItem(true);
              }
            }}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm dark:shadow-indigo-900/50"
          >
            <Plus size={18} />
            <span>Goal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {state.categories.map(cat => {
          const items = state.items.filter(i => i.categoryId === cat.id);
          const isTarget = draggedOverCatId === cat.id;
          
          return (
            <section 
              key={cat.id} 
              aria-label={`Category: ${cat.name}`}
              onDrop={(e) => handleDrop(e, cat.id)}
              onDragOver={(e) => handleDragOver(e, cat.id)}
              onDragLeave={handleDragLeave}
              className={`animate-in slide-in-from-bottom-4 duration-500 p-0 sm:p-6 rounded-3xl transition-all border-2 border-transparent ${isTarget ? 'bg-indigo-50 dark:bg-indigo-900/20 border-dashed border-indigo-300 dark:border-indigo-700 scale-[1.01]' : 'bg-transparent'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${cat.color} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                    <Tag size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cat.name}</h2>
                  <span className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">{items.length} goals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStartEditCategory(cat)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => onSelectItem(item.id)}
                    aria-label={`Select goal: ${item.name}`}
                    className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 active:scale-95 active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left w-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                        <BookOpen size={24} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-all transform group-hover:translate-x-1" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{item.topics.length} core topics</p>
                    
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-1000" 
                        style={{ width: `${(item.topics.filter(t => t.isCompleted).length / (Math.max(1, item.topics.length))) * 100}%` }}
                      />
                    </div>
                  </button>
                ))}
                <button 
                  onClick={() => {
                    setSelectedCatId(cat.id);
                    setIsAddingItem(true);
                  }}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-white dark:hover:bg-gray-800 transition-all group min-h-[160px]"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                    <Plus size={24} className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">New Goal</span>
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {/* Add Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Learning Goal</h3>
              <button onClick={() => {
                setIsAddingItem(false);
                setNewItemName('');
                setNewItemDescription('');
                setIsJsonImportMode(false);
                setJsonText('');
                setJsonError(null);
              }} className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</button>
            </div>

            {isJsonImportMode ? (
              <form onSubmit={handleJsonImport} className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsJsonImportMode(false);
                        setJsonText('');
                        setJsonError(null);
                      }}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X size={16} />
                      <span>Back to Form</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowJsonInfo(true)}
                    className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="View JSON structure"
                  >
                    <Info size={16} />
                    <span>JSON Format</span>
                  </button>
                </div>

                <div>
                  <label htmlFor="goal-category-json" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <FormControl fullWidth required>
                    <Select
                      id="goal-category-json"
                      value={selectedCatId}
                      onChange={(e: any) => setSelectedCatId(e.target.value)}
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'inherit',
                        },
                      }}
                    >
                      {state.categories.map(c => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div>
                  <label htmlFor="json-input" className="block text-sm font-semibold text-gray-700 mb-2">JSON Data</label>
                  <textarea 
                    id="json-input"
                    autoFocus
                    value={jsonText}
                    onChange={e => {
                      setJsonText(e.target.value);
                      setJsonError(null);
                    }}
                    placeholder="Paste your JSON here..."
                    rows={12}
                    className={`w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none font-mono text-sm ${
                      jsonError ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    required
                  />
                  {jsonError && (
                    <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{jsonError}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddingItem(false);
                      setIsJsonImportMode(false);
                      setJsonText('');
                      setJsonError(null);
                    }}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    Import Goal
                  </button>
                </div>
              </form>
            ) : (
            <form onSubmit={handleCreateItem} className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsJsonImportMode(true);
                        setJsonError(null);
                      }}
                      className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <FileJson size={16} />
                      <span>Import from JSON</span>
                    </button>
                  </div>
                </div>

              <div>
                <label htmlFor="goal-title" className="block text-sm font-semibold text-gray-700 mb-2">Goal Title</label>
                <input 
                  id="goal-title"
                  autoFocus
                  type="text" 
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="e.g. Master React, Digital Painting..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="goal-description" className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea 
                  id="goal-description"
                  value={newItemDescription}
                  onChange={e => setNewItemDescription(e.target.value)}
                  placeholder="Add a description for this learning goal..."
                  rows={3}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 placeholder:text-gray-400 resize-none"
                />
              </div>
              <div>
                  <label htmlFor="goal-category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <FormControl fullWidth required>
                    <Select
                  id="goal-category"
                  value={selectedCatId}
                      onChange={(e: any) => setSelectedCatId(e.target.value)}
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'inherit',
                        },
                      }}
                >
                  {state.categories.map(c => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                    </Select>
                  </FormControl>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsAddingItem(false);
                    setNewItemName('');
                    setNewItemDescription('');
                      setIsJsonImportMode(false);
                      setJsonText('');
                      setJsonError(null);
                  }}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  Create Goal
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* JSON Format Info Modal */}
      {showJsonInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl p-8 shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">JSON Format Reference</h3>
              <button 
                onClick={() => setShowJsonInfo(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm text-indigo-900 mb-2">
                  <strong>Required fields:</strong> <code className="bg-indigo-100 px-1.5 py-0.5 rounded">name</code>
                </p>
                <p className="text-sm text-indigo-900">
                  <strong>Optional fields:</strong> <code className="bg-indigo-100 px-1.5 py-0.5 rounded">description</code>, <code className="bg-indigo-100 px-1.5 py-0.5 rounded">topics</code>, <code className="bg-indigo-100 px-1.5 py-0.5 rounded">status</code>, <code className="bg-indigo-100 px-1.5 py-0.5 rounded">comments</code>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Example JSON Structure:</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-xs relative">                  
                  <code>{JSON.stringify(exampleJsonFormat, null, 2)}</code>
                  <button className="text-gray-400 hover:text-gray-600 text-sm font-light absolute top-0 right-0 bg-gray-900 text-gray-100 p-2 rounded-xl" onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(exampleJsonFormat, null, 2));
                    showAlert({
                      type: 'success',
                      title: 'Copied to clipboard',
                      message: 'Example JSON structure copied to clipboard',
                    });
                  }}>Copy</button>
                </pre>
                
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Field Descriptions:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><code className="bg-white px-1.5 py-0.5 rounded">name</code> (string, required): The goal title</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">description</code> (string, optional): Goal description</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">topics</code> (array, optional): Array of topic objects</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">status</code> (string, optional): "Not started" | "In progress" | "Completed"</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">comments</code> (string, optional): Additional comments</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Topic Object Structure:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><code className="bg-white px-1.5 py-0.5 rounded">id</code> (string, optional): Auto-generated if not provided</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">title</code> (string, required): Topic name</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">isCompleted</code> (boolean, optional): Defaults to false</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">deadline</code> (string, optional): Date in YYYY-MM-DD format</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">notes</code> (string, optional): Topic notes</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">subTopics</code> (array, optional): Array of subTopic objects</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">SubTopic Object Structure:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><code className="bg-white px-1.5 py-0.5 rounded">id</code> (string, optional): Auto-generated if not provided</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">title</code> (string, required): SubTopic name</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">isCompleted</code> (boolean, optional): Defaults to false</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">notes</code> (string, optional): SubTopic notes</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowJsonInfo(false)}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Create Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-6">
              <div>
                <label htmlFor="category-name-input" className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input 
                  id="category-name-input"
                  autoFocus
                  type="text" 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Wellness, Finance..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-700 mb-3">Color Label</legend>
                <div className="flex flex-wrap gap-3">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      aria-label={`Select ${c} color`}
                      className={`w-8 h-8 rounded-full ${c} ring-offset-2 transition-all ${newCatColor === c ? 'ring-2 ring-indigo-500 scale-110' : ''}`}
                    />
                  ))}
                </div>
              </fieldset>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategoryId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Category</h3>
              <button 
                onClick={() => {
                  setEditingCategoryId(null);
                  setEditCatName('');
                  setEditCatColor('bg-blue-500');
                }} 
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateCategory} className="space-y-6">
              <div>
                <label htmlFor="edit-category-name-input" className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input 
                  id="edit-category-name-input"
                  autoFocus
                  type="text" 
                  value={editCatName}
                  onChange={e => setEditCatName(e.target.value)}
                  placeholder="e.g. Wellness, Finance..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-700 mb-3">Color Label</legend>
                <div className="flex flex-wrap gap-3">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditCatColor(c)}
                      aria-label={`Select ${c} color`}
                      className={`w-8 h-8 rounded-full ${c} ring-offset-2 transition-all ${editCatColor === c ? 'ring-2 ring-indigo-500 scale-110' : ''}`}
                    />
                  ))}
                </div>
              </fieldset>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setEditCatName('');
                    setEditCatColor('bg-blue-500');
                  }}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
