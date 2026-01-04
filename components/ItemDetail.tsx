'use client';

import React, { useMemo, useState } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Calendar, 
  Plus,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  MessageSquare,
  StickyNote,
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Select, MenuItem, FormControl } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LearningItem, Category, Topic, SubTopic, GoalStatus } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface ItemDetailProps {
  item: LearningItem;
  category?: Category;
  onUpdateItemName: (id: string, newName: string) => void;
  onUpdateItemStatus: (id: string, status: GoalStatus) => void;
  onUpdateItemComments: (id: string, comments: string) => void;
  onUpdateTopic: (itemId: string, topicId: string, isCompleted: boolean) => void;
  onUpdateTopicName: (itemId: string, topicId: string, newTitle: string) => void;
  onUpdateTopicDeadline: (itemId: string, topicId: string, deadline: string) => void;
  onUpdateTopicNotes: (itemId: string, topicId: string, notes: string) => void;
  onDeleteTopic: (itemId: string, topicId: string) => void;
  onAddTopic: (itemId: string) => void;
  onAddSubTopic: (itemId: string, topicId: string) => void;
  onUpdateSubTopic: (itemId: string, topicId: string, subTopicId: string, isCompleted: boolean) => void;
  onUpdateSubTopicName: (itemId: string, topicId: string, subTopicId: string, newTitle: string) => void;
  onUpdateSubTopicNotes: (itemId: string, topicId: string, subTopicId: string, notes: string) => void;
  onDeleteSubTopic: (itemId: string, topicId: string, subTopicId: string) => void;
  onUpdateItemTopics: (itemId: string, topics: Topic[]) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ 
  item, 
  category, 
  onUpdateItemName,
  onUpdateItemStatus,
  onUpdateItemComments,
  onUpdateTopic, 
  onUpdateTopicName,
  onUpdateTopicDeadline,
  onUpdateTopicNotes,
  onDeleteTopic,
  onAddTopic,
  onAddSubTopic,
  onUpdateSubTopic, 
  onUpdateSubTopicName,
  onUpdateSubTopicNotes,
  onDeleteSubTopic,
  onUpdateItemTopics,
  onDelete, 
  onBack 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  const progressStats = useMemo(() => {
    const total = item.topics.reduce((acc, t) => acc + t.subTopics.length, 0);
    const completed = item.topics.reduce((acc, t) => acc + t.subTopics.filter(st => st.isCompleted).length, 0);
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [item.topics]);

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveName = () => {
    if (editingId === 'goal') {
      onUpdateItemName(item.id, editText);
    } else if (editingId?.startsWith('topic-')) {
      onUpdateTopicName(item.id, editingId, editText);
    } else if (editingId?.startsWith('sub-')) {
      const [topicId, subId] = editingId.split(':::');
      onUpdateSubTopicName(item.id, topicId?.replace('sub-', ''), subId, editText);
    }
    cancelEditing();
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const handleGeneratePath = () => {
    if (item.topics.length > 0) {
      showConfirm({
        type: 'warning',
        title: 'Replace Roadmap?',
        message: 'This will replace your existing roadmap. Continue?',
        onConfirm: () => {
          generateRoadmap();
        },
        confirmText: 'Continue',
        cancelText: 'Cancel'
      });
    } else {
      generateRoadmap();
      }
  };

  const generateRoadmap = async () => {
    setIsGeneratingPath(true);
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemName: item.name }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        showAlert({
          type: 'error',
          title: 'Failed to Generate Roadmap',
          message: errorData.error || 'Unknown error occurred. Please try again.'
        });
        return;
      }
      
      const data = await response.json();
      const roadmap: Topic[] = data.topics || [];
      onUpdateItemTopics(item.id, roadmap);
      showAlert({
        type: 'success',
        title: 'Roadmap Generated',
        message: 'Your learning roadmap has been successfully generated!'
      });
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
      showAlert({
        type: 'error',
        title: 'Failed to Generate Roadmap',
        message: 'An error occurred while generating the roadmap. Please try again.'
      });
    } finally {
      setIsGeneratingPath(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 ${category?.color || 'bg-indigo-500'} opacity-10 blur-3xl -mr-10 -mt-10 rounded-full`} />
        
        <div className="flex items-center justify-between relative z-10 mb-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
              value={item.status}
                onChange={(e: any) => onUpdateItemStatus(item.id, e.target.value as GoalStatus)}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  height: '36px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'inherit',
                  },
                }}
                size="small"
            >
                <MenuItem value="Not started">Not started</MenuItem>
                <MenuItem value="In progress">In progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <button 
              onClick={() => {
                showConfirm({
                  type: 'warning',
                  title: 'Delete Goal?',
                  message: 'Are you sure you want to delete this goal? This action cannot be undone.',
                  onConfirm: () => onDelete(item.id),
                  confirmText: 'Delete',
                  cancelText: 'Cancel'
                });
              }}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2 text-xs text-[10px] sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              <span className={`w-2 h-2 rounded-full ${category?.color || 'bg-indigo-500'}`} />
              <span>{category?.name || 'Uncategorized'}</span>
            </div>
            
            {editingId === 'goal' ? (
              <div className="flex items-center space-x-2">
                <input 
                  autoFocus
                  className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-indigo-200 dark:border-indigo-600 rounded-lg px-2 py-1 outline-none w-full"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
                <button onClick={handleSaveName} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full"><Check size={20} /></button>
                <button onClick={cancelEditing} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"><X size={20} /></button>
              </div>
            ) : (
              <div className="flex items-center group">
                <h1 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white mr-3">{item.name}</h1>
                <button 
                  onClick={() => startEditing('goal', item.name)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                >
                  <Pencil size={18} />
                </button>
              </div>
            )}
            
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm">
              <Calendar size={14} />
              Started {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{progressStats.percent}%</span>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Completion</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{progressStats.completed} / {progressStats.total} Steps</p>
              </div>
            </div>
            <div className="w-48 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                className="bg-indigo-600 h-full transition-all duration-1000 shadow-lg shadow-indigo-200" 
                style={{ width: `${progressStats.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Goal Comments */}
        <div className="mt-8 relative z-10 border-t border-gray-100 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-indigo-500" />
            General Comments
          </h3>
          <textarea 
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[100px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Add overall thoughts or reflections about this goal..."
            value={item.comments || ''}
            onChange={(e) => onUpdateItemComments(item.id, e.target.value)}
          />
        </div>
      </div>

      {/* Topics Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-md sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ChevronDown size={20} className="text-indigo-500" />
            Curriculum Roadmap
          </h2>
          <div className="flex items-center gap-2">
            {item.topics.length === 0 && (
              <button 
                onClick={handleGeneratePath}
                disabled={isGeneratingPath}
                className="flex items-center space-x-1.5 text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-sm dark:shadow-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPath ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Path with AI</span>
                  </>
                )}
              </button>
            )}
            <button 
              onClick={() => onAddTopic(item.id)}
              className="flex items-center space-x-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full hover:bg-indigo-600 dark:hover:bg-indigo-700 hover:text-white transition-all shadow-sm dark:shadow-gray-900/20"
            >
              <Plus size={14} />
              <span>Add Module</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {item.topics.map((topic, topicIdx) => {
            const overdue = !topic.isCompleted && isOverdue(topic.deadline);
            return (
              <div key={topic.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group">
                <div className={`p-6 flex items-start border-l-8 transition-all ${topic.isCompleted ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-900/20' : overdue ? 'border-rose-500 dark:border-rose-600 bg-rose-50/10 dark:bg-rose-900/20' : 'border-indigo-500 dark:border-indigo-600'}`}>
                  <button 
                    onClick={() => onUpdateTopic(item.id, topic.id, !topic.isCompleted)}
                    className={`mr-5 mt-1 transition-all transform active:scale-90 ${topic.isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600 hover:text-indigo-400'}`}
                  >
                    {topic.isCompleted ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 tabular-nums tracking-widest uppercase">Module {topicIdx + 1}</span>
                        {topic.isCompleted && (
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase">Mastered</span>
                        )}
                        {overdue && (
                          <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                            <AlertCircle size={10} /> Overdue
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-1 rounded-full border border-gray-100 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group/deadline shadow-sm">
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              value={topic.deadline ? new Date(topic.deadline) : null}
                              onChange={(newValue: any) => {
                                if (newValue) {
                                  const dateStr = newValue.toISOString().split('T')[0];
                                  onUpdateTopicDeadline(item.id, topic.id, dateStr);
                                } else {
                                  onUpdateTopicDeadline(item.id, topic.id, '');
                                }
                              }}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  sx: {
                                    '& .MuiOutlinedInput-root': {
                                      fontSize: '0.6875rem',
                                      fontWeight: 700,
                                      height: 'auto',
                                      minWidth: '120px',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      '& fieldset': {
                                        border: 'none',
                                      },
                                      '&:hover fieldset': {
                                        border: 'none',
                                      },
                                      '&.Mui-focused fieldset': {
                                        border: 'none',
                                      },
                                    },
                                    '& .MuiInputBase-input': {
                                      fontSize: '10px',
                                      padding: '0 0.375rem',
                                      color: overdue 
                                        ? 'rgb(225 29 72)' 
                                        : 'inherit',
                                    },
                                    'fieldset': {
                                      border: 'none',
                                    },
                                    '& .MuiPickersSectionList-root': {
                                      border: 'none',
                                      p:0,
                                      width: '100%',
                                    },
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                          {/* {topic.deadline && (
                            <button
                              onClick={() => onUpdateTopicDeadline(item.id, topic.id, '')}
                              className="hidden group-hover/deadline:inline-block opacity-0 group-hover/deadline:opacity-100 transition-all duration-300 ease-out text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-0.5 rounded"
                              style={{transitionProperty: 'opacity, display'}}
                              title="Clear deadline"
                            >
                              <X size={12} />
                            </button>
                          )} */}
                        </div>
                      </div>
                    </div>
                    
                    {editingId === topic.id ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <input 
                          autoFocus
                          className="font-bold text-xs sm:text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-indigo-200 dark:border-indigo-600 rounded-lg px-3 py-1.5 outline-none w-full"
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                        />
                        <button onClick={handleSaveName} className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg"><Check size={20} /></button>
                        <button onClick={cancelEditing} className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><X size={20} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center group/title">
                        <h3 className={`text-md sm:text-lg font-bold ${topic.isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : overdue ? 'text-rose-900 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                          {topic.title}
                        </h3>
                        <button 
                          onClick={() => startEditing(topic.id, topic.title)}
                          className="p-1.5 opacity-0 group-hover/title:opacity-100 transition-opacity text-gray-300 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 ml-2"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4 self-center">
                    <button 
                      onClick={() => toggleNotes(topic.id)}
                      className={`p-2 rounded-xl transition-all ${expandedNotes[topic.id] ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
                      title="Topic Notes"
                    >
                      <StickyNote size={20} />
                    </button>
                    <button 
                      onClick={() => onAddSubTopic(item.id, topic.id)}
                      className="p-2 text-indigo-300 dark:text-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                    >
                      <Plus size={20} />
                    </button>
                    <button 
                      onClick={() => {
                        showConfirm({
                          type: 'warning',
                          title: 'Delete Module?',
                          message: 'Are you sure you want to delete this module? This action cannot be undone.',
                          onConfirm: () => onDeleteTopic(item.id, topic.id),
                          confirmText: 'Delete',
                          cancelText: 'Cancel'
                        });
                      }}
                      className="p-2 text-gray-200 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Topic Notes Section */}
                {expandedNotes[topic.id] && (
                  <div className="px-14 py-4 bg-indigo-50/30 dark:bg-indigo-900/20 border-t border-indigo-100/50 dark:border-indigo-800/50">
                    <textarea 
                      className="w-full p-4 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[80px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Add specific notes or resources for this module..."
                      value={topic.notes || ''}
                      onChange={(e) => onUpdateTopicNotes(item.id, topic.id, e.target.value)}
                    />
                  </div>
                )}

                {/* Sub-topics */}
                <div className="bg-gray-50/30 dark:bg-gray-700/30 divide-y divide-gray-100/50 dark:divide-gray-700/50">
                  {topic.subTopics.map((subTopic) => (
                    <div key={subTopic.id} className="flex flex-col">
                      <div className="py-4 px-14 flex items-center hover:bg-white/80 dark:hover:bg-gray-700/50 transition-colors group/sub">
                        <button 
                          onClick={() => onUpdateSubTopic(item.id, topic.id, subTopic.id, !subTopic.isCompleted)}
                          className={`mr-4 transition-colors ${subTopic.isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600 group-hover/sub:text-indigo-400'}`}
                        >
                          {subTopic.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          {editingId === `sub-${topic.id}:::${subTopic.id}` ? (
                            <div className="flex items-center space-x-2">
                              <input 
                                autoFocus
                                className="text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-600 rounded-lg px-2 py-1 outline-none w-full"
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                              />
                              <button onClick={handleSaveName} className="text-emerald-600 dark:text-emerald-400"><Check size={18} /></button>
                              <button onClick={cancelEditing} className="text-red-500 dark:text-red-400"><X size={18} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center group/subtitle">
                              <span 
                                className={`text-sm font-medium cursor-pointer ${subTopic.isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}
                                onClick={() => onUpdateSubTopic(item.id, topic.id, subTopic.id, !subTopic.isCompleted)}
                              >
                                {subTopic.title}
                              </span>
                              <button 
                                onClick={() => startEditing(`sub-${topic.id}:::${subTopic.id}`, subTopic.title)}
                                className="p-1 opacity-0 group-hover/subtitle:opacity-100 transition-opacity text-gray-300 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 ml-2"
                              >
                                <Pencil size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => toggleNotes(subTopic.id)}
                            className={`p-2 rounded-lg transition-all ${expandedNotes[subTopic.id] ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover/sub:opacity-100 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
                        >
                          <StickyNote size={16} />
                        </button>
                          <button 
                            onClick={() => {
                              showConfirm({
                                type: 'warning',
                                title: 'Delete Objective?',
                                message: 'Are you sure you want to delete this objective? This action cannot be undone.',
                                onConfirm: () => onDeleteSubTopic(item.id, topic.id, subTopic.id),
                                confirmText: 'Delete',
                                cancelText: 'Cancel'
                              });
                            }}
                            className="p-2 text-gray-200 dark:text-gray-600 opacity-0 group-hover/sub:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                            title="Delete objective"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Sub-topic Notes */}
                      {expandedNotes[subTopic.id] && (
                        <div className="px-20 pb-4 bg-white/50 dark:bg-gray-800/50">
                          <textarea 
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[60px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="Add notes for this objective..."
                            value={subTopic.notes || ''}
                            onChange={(e) => onUpdateSubTopicNotes(item.id, topic.id, subTopic.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {topic.subTopics.length === 0 && (
                    <div className="py-6 text-center">
                      <button 
                        onClick={() => onAddSubTopic(item.id, topic.id)}
                        className="text-xs font-bold text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 mx-auto"
                      >
                        <Plus size={14} /> Add objective
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {item.topics.length === 0 && (
            <div className="text-center p-16 bg-white dark:bg-gray-800 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-700 shadow-inner">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-gray-200 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">No roadmap modules yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto mb-8">Ready to start? Create your first module to begin your journey.</p>
              <button 
                onClick={() => onAddTopic(item.id)}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-indigo-900/50"
              >
                <Plus size={24} />
                <span>Add Module</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
