'use client';

import React, { useMemo } from 'react';
import { ArrowLeft, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { LearningState, LearningItem } from '../types';

interface FilteredItemsViewProps {
  state: LearningState;
  filterType: 'all' | 'completed-topics' | 'categories' | null;
  onSelectItem: (id: string) => void;
  onBack: () => void;
}

const FilteredItemsView: React.FC<FilteredItemsViewProps> = ({ 
  state, 
  filterType, 
  onSelectItem, 
  onBack 
}) => {
  const calculateProgress = (item: LearningItem) => {
    if (item.topics.length === 0) return 0;
    const totalSubTopics = item.topics.reduce((acc, t) => acc + t.subTopics.length, 0);
    const completedSubTopics = item.topics.reduce((acc, t) => acc + t.subTopics.filter(st => st.isCompleted).length, 0);
    return totalSubTopics === 0 ? 0 : Math.round((completedSubTopics / totalSubTopics) * 100);
  };

  const filteredItems = useMemo(() => {
    if (!filterType) return [];
    
    switch (filterType) {
      case 'all':
        return state.items;
      case 'completed-topics':
        return state.items.filter(item => 
          item.topics.some(topic => topic.isCompleted)
        );
      case 'categories':
        return state.items;
      default:
        return [];
    }
  }, [state.items, filterType]);

  const getTitle = () => {
    switch (filterType) {
      case 'all':
        return 'All Active Goals';
      case 'completed-topics':
        return 'Goals with Completed Topics';
      case 'categories':
        return 'All Goals by Category';
      default:
        return 'Filtered Goals';
    }
  };

  const getDescription = () => {
    switch (filterType) {
      case 'all':
        return `Showing all ${filteredItems.length} active learning goals`;
      case 'completed-topics':
        return `Showing ${filteredItems.length} goal(s) with at least one completed topic`;
      case 'categories':
        return `Showing all goals organized by category`;
      default:
        return '';
    }
  };

  if (filterType === 'categories') {
    // Group items by category
    const itemsByCategory = state.categories.map(cat => ({
      category: cat,
      items: state.items.filter(item => item.categoryId === cat.id)
    })).filter(group => group.items.length > 0);

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getTitle()}</h1>
              <p className="text-gray-500 dark:text-gray-400">{getDescription()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {itemsByCategory.map(({ category, items }) => (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{category.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{items.length} goal{items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {items.map((item) => {
                  const progress = calculateProgress(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item.id)}
                      className="p-6 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    >
                      <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center text-white mr-4 shadow-sm`}>
                        <BookOpen size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.description || 'No description'}</p>
                      </div>
                      <div className="ml-4 flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full transition-all duration-700"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                          <Clock size={10} />
                          Created {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
            <p className="text-gray-500">{getDescription()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const progress = calculateProgress(item);
              const cat = state.categories.find(c => c.id === item.categoryId);
              const completedTopicsCount = item.topics.filter(t => t.isCompleted).length;
              
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item.id)}
                  className="p-6 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl ${cat?.color || 'bg-gray-200'} flex items-center justify-center text-white mr-4 shadow-sm`}>
                    <BookOpen size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500 truncate">{cat?.name || 'Uncategorized'}</p>
                      {filterType === 'completed-topics' && completedTopicsCount > 0 && (
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={12} />
                          {completedTopicsCount} topic{completedTopicsCount !== 1 ? 's' : ''} completed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full transition-all duration-700"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                          <Clock size={10} />
                          Created {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500">
              <p>No goals match this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilteredItemsView;

