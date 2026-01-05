'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  LayoutDashboard, 
  Plus, 
  Layers, 
  Sparkles,
  Settings,
  Bell,
  Loader2
} from 'lucide-react';
import { Category, LearningItem, LearningState, Topic, SubTopic, GoalStatus } from '../types';
import Dashboard from '../components/Dashboard';
import CategoryList from '../components/CategoryList';
import ItemDetail from '../components/ItemDetail';
import FilteredItemsView from '../components/FilteredItemsView';
import SearchAutocomplete from '../components/SearchAutocomplete';
import SettingsModal from '../components/SettingsModal';
import { useAuth } from '../contexts/AuthContext';
import { scrollToBottom } from './shared/helper';

const INITIAL_STATE: LearningState = {
  categories: [],
  items: []
};

// Helper to convert MongoDB document to Category
const convertCategory = (cat: any): Category => ({
  id: cat._id || cat.id,
  name: cat.name,
  color: cat.color,
  icon: cat.icon || 'Tag'
});

// Helper to convert MongoDB document to LearningItem
const convertItem = (item: any): LearningItem => ({
  id: item._id || item.id,
  categoryId: typeof item.categoryId === 'object' ? (item.categoryId._id || item.categoryId.id) : item.categoryId,
  name: item.name,
  description: item.description || '',
  topics: item.topics || [],
  createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
  status: item.status || 'Not started',
  comments: item.comments || ''
});

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, token, logout, user } = useAuth(); console.log('home',token);
  const [state, setState] = useState<LearningState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'categories' | 'item' | 'filtered'>('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'completed-topics' | 'categories' | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    console.log('useEffect',authLoading, isAuthenticated, user);
    if (!authLoading && isAuthenticated && user && !user.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch initial data from MongoDB
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        setState({
          categories: (data.categories || []).map(convertCategory),
          items: (data.items || []).map(convertItem)
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, token]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || localStorage.getItem('auth_token')}`,
  });

  const addCategory = async (name: string, color: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, color, icon: 'Tag' })
      });
      if (!response.ok) throw new Error('Failed to create category');
      const { category } = await response.json();
      setState(prev => ({ ...prev, categories: [...prev.categories, convertCategory(category)] }));
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const updateCategory = async (id: string, name: string, color: string) => {
    console.log('updateCategory',getAuthHeaders);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, color, icon: 'Tag' })
      });
      if (!response.ok) throw new Error('Failed to update category');
      const { category } = await response.json();
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(c => c.id === id ? convertCategory(category) : c)
      }));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete category');
      setState(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addItem = async (categoryId: string, name: string, description: string, topics: Topic[] = []) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ categoryId, name, description, topics })
      });
      if (!response.ok) throw new Error('Failed to create item');
      const { item } = await response.json();
      const newItem = convertItem(item);
      setState(prev => ({ ...prev, items: [...prev.items, newItem] }));
      return newItem.id as string;
    } catch (error) {
      console.error('Error adding item:', error);
      return null;
    }
  };

  const updateItemName = async (id: string, newName: string) => {    
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newName })
      });
      if (!response.ok) throw new Error('Failed to update item');
      const { item } = await response.json();
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === id ? convertItem(item) : i)
      }));
    } catch (error) {
      console.error('Error updating item name:', error);
    }
  };

  const updateItemStatus = async (id: string, status: GoalStatus) => {
    console.log('updateItemStatus',getAuthHeaders);
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update item status');
      const { item } = await response.json();
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === id ? convertItem(item) : i)
      }));
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const updateItemComments = async (id: string, comments: string) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comments })
      });
      if (!response.ok) throw new Error('Failed to update item comments');
      const { item } = await response.json();
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === id ? convertItem(item) : i)
      }));
    } catch (error) {
      console.error('Error updating item comments:', error);
    }
  };

  const moveItemToCategory = async (itemId: string, categoryId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId })
      });
      if (!response.ok) throw new Error('Failed to move item');
      const { item } = await response.json();
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === itemId ? convertItem(item) : i)
      }));
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete item');
      setState(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
      if (selectedItemId === id) {
        setActiveTab('dashboard');
        setSelectedItemId(null);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const updateItemTopics = async (itemId: string, topics: Topic[]) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ topics })
      });
      if (!response.ok) throw new Error('Failed to update item topics');
      const { item } = await response.json();
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === itemId ? convertItem(item) : i)
      }));
    } catch (error) {
      console.error('Error updating item topics:', error);
    }
  };

  const updateTopicProgress = async (itemId: string, topicId: string, isCompleted: boolean) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const updatedTopics = item.topics.map(t => {
      if (t.id !== topicId) return t;
      return {
        ...t,
        isCompleted,
        subTopics: t.subTopics.map(st => ({ ...st, isCompleted }))
      };
    });
    
    await updateItemTopics(itemId, updatedTopics);
  };

  const updateTopicDeadline = async (itemId: string, topicId: string, deadline: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const updatedTopics = item.topics.map(t => 
      t.id === topicId ? { ...t, deadline } : t
    );
    
    await updateItemTopics(itemId, updatedTopics);
  };

  const updateTopicNotes = async (itemId: string, topicId: string, notes: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const updatedTopics = item.topics.map(t => 
      t.id === topicId ? { ...t, notes } : t
    );
    
    await updateItemTopics(itemId, updatedTopics);
  };

  const updateTopicName = async (itemId: string, topicId: string, newTitle: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const updatedTopics = item.topics.map(t => 
      t.id === topicId ? { ...t, title: newTitle } : t
    );
    
    await updateItemTopics(itemId, updatedTopics);
  };

  const deleteTopic = async (itemId: string, topicId: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const updatedTopics = item.topics.filter(t => t.id !== topicId);
    await updateItemTopics(itemId, updatedTopics);
  };

  const addTopic = async (itemId: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: 'New Module',
      isCompleted: false,
      subTopics: []
    };
    
    const updatedTopics = [...item.topics, newTopic];
    await updateItemTopics(itemId, updatedTopics);
    // scrollToBottom();
  };

  const addSubTopic = async (itemId: string, topicId: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const newSubTopic: SubTopic = {
      id: `subtopic-${Date.now()}`,
      title: 'New Objective',
      isCompleted: false
    };
    
    const updatedTopics = item.topics.map(t => 
      t.id === topicId ? { ...t, subTopics: [...t.subTopics, newSubTopic] } : t
    );
    
    await updateItemTopics(itemId, updatedTopics);
  };

  const updateSubTopicName = async (itemId: string, topicId: string, subTopicId: string, newTitle: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const topic = item.topics.find(t => t.id === topicId);
    const subTopic = topic?.subTopics.find(st => st.id === subTopicId);
    console.log(' updateSubTopicName ItemId:', itemId);
    console.log(' updateSubTopicName TopicId:', topicId);
    console.log(' updateSubTopicName SubTopicId:', subTopicId);
    console.log(' updateSubTopicName NewTitle:', newTitle);
    console.log(' updateSubTopicName Item:', item);
    console.log(' updateSubTopicName Topic:', topic);
    console.log(' updateSubTopicName SubTopic:', subTopic);
    const updatedTopics = item.topics.map(t => {
      if (t.id !== topicId) return t;
      return {
        ...t,
        subTopics: t.subTopics.map(st => st.id === subTopicId ? { ...st, title: newTitle } : st)
      };
    });
    await updateItemTopics(itemId, updatedTopics);
  };

  const updateSubTopicNotes = async (itemId: string, topicId: string, subTopicId: string, notes: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const updatedTopics = item.topics.map(t => {
      if (t.id !== topicId) return t;
      return {
        ...t,
        subTopics: t.subTopics.map(st => st.id === subTopicId ? { ...st, notes } : st)
      };
    });
    
    await updateItemTopics(itemId, updatedTopics);
  };

  const deleteSubTopic = async (itemId: string, topicId: string, subTopicId: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const updatedTopics = item.topics.map(t => {
      if (t.id !== topicId) return t;
      return {
        ...t,
        subTopics: t.subTopics.filter(st => st.id !== subTopicId)
      };
    });
    
    await updateItemTopics(itemId, updatedTopics);
  };

  const updateSubTopicProgress = async (itemId: string, topicId: string, subTopicId: string, isCompleted: boolean) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    const updatedTopics = item.topics.map(t => {
      if (t.id !== topicId) return t;
      const updatedSubTopics = t.subTopics.map(st => 
        st.id === subTopicId ? { ...st, isCompleted } : st
      );
      const allSubCompleted = updatedSubTopics.length > 0 && updatedSubTopics.every(st => st.isCompleted);
      return { ...t, subTopics: updatedSubTopics, isCompleted: allSubCompleted };
    });
    
    await updateItemTopics(itemId, updatedTopics);
  };

  const selectedItem = useMemo(() => 
    state.items.find(i => i.id === selectedItemId), 
  [state.items, selectedItemId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-gray-600">Loading your learning data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Callisto</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <Layers size={20} />
            <span>Categories</span>
          </button>
          <div className="pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3">Quick Access</span>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
            {state.items.slice(0, 5).map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItemId(item.id);
                  setActiveTab('item');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm truncate transition-colors ${selectedItemId === item.id && activeTab === 'item' ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
              >
                <BookOpen size={16} />
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => router.push('/profile')}>
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.useCase}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 z-10">
          <div className="flex items-center flex-1 max-w-md">
            <SearchAutocomplete
              state={state}
              onSelectItem={(id) => {
                setSelectedItemId(id);
                setActiveTab('item');
              }}
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Bell size={20} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <Dashboard 
              state={state} 
              onSelectItem={(id) => {
                setSelectedItemId(id);
                setActiveTab('item');
              }}
              onAddItem={() => setActiveTab('categories')}
              onFilterClick={(filter) => {
                setFilterType(filter);
                setActiveTab('filtered');
              }}
            />
          )}

          {activeTab === 'filtered' && (
            <FilteredItemsView
              state={state}
              filterType={filterType}
              onSelectItem={(id) => {
                setSelectedItemId(id);
                setActiveTab('item');
              }}
              onBack={() => setActiveTab('dashboard')}
            />
          )}
          
          {activeTab === 'categories' && (
            <CategoryList 
              state={state} 
              onAddItem={addItem} 
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onMoveItem={moveItemToCategory}
              onSelectItem={(id) => {
                setSelectedItemId(id);
                setActiveTab('item');
              }}
            />
          )}

          {activeTab === 'item' && selectedItem && (
            <ItemDetail 
              item={selectedItem}
              category={state.categories.find(c => c.id === selectedItem.categoryId)}
              onUpdateItemName={updateItemName}
              onUpdateItemStatus={updateItemStatus}
              onUpdateItemComments={updateItemComments}
              onUpdateTopic={updateTopicProgress}
              onUpdateTopicName={updateTopicName}
              onUpdateTopicDeadline={updateTopicDeadline}
              onUpdateTopicNotes={updateTopicNotes}
              onDeleteTopic={deleteTopic}
              onAddTopic={addTopic}
              onAddSubTopic={addSubTopic}
              onUpdateSubTopic={updateSubTopicProgress}
              onUpdateSubTopicName={updateSubTopicName}
              onUpdateSubTopicNotes={updateSubTopicNotes}
              onDeleteSubTopic={deleteSubTopic}
              onUpdateItemTopics={updateItemTopics}
              onDelete={deleteItem}
              onBack={() => setActiveTab('dashboard')}
            />
          )}
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
