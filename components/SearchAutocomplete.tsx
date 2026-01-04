'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, BookOpen, Tag, FileText, X, ArrowRight } from 'lucide-react';
import { LearningState, LearningItem, Category } from '../types';

interface SearchResult {
  type: 'item' | 'topic' | 'subtopic' | 'category';
  id: string;
  itemId?: string;
  topicId?: string;
  title: string;
  subtitle?: string;
  category?: Category;
}

interface SearchAutocompleteProps {
  state: LearningState;
  onSelectItem: (itemId: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ 
  state, 
  onSelectItem,
  onSelectCategory 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search categories
    state.categories.forEach(category => {
      if (category.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'category',
          id: category.id,
          title: category.name,
          subtitle: 'Category',
          category: category
        });
      }
    });

    // Search items (goals)
    state.items.forEach(item => {
      const category = state.categories.find(c => c.id === item.categoryId);
      
      // Match item name
      if (item.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'item',
          id: item.id,
          itemId: item.id,
          title: item.name,
          subtitle: category?.name || 'Uncategorized',
          category: category
        });
      }

      // Match item description
      if (item.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'item',
          id: item.id,
          itemId: item.id,
          title: item.name,
          subtitle: `Description: ${item.description.substring(0, 50)}...`,
          category: category
        });
      }

      // Search topics
      item.topics.forEach(topic => {
        if (topic.title.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'topic',
            id: `${item.id}-${topic.id}`,
            itemId: item.id,
            topicId: topic.id,
            title: topic.title,
            subtitle: `Topic in: ${item.name}`,
            category: category
          });
        }

        // Search subtopics
        topic.subTopics.forEach(subTopic => {
          if (subTopic.title.toLowerCase().includes(lowerQuery)) {
            results.push({
              type: 'subtopic',
              id: `${item.id}-${topic.id}-${subTopic.id}`,
              itemId: item.id,
              topicId: topic.id,
              title: subTopic.title,
              subtitle: `Objective in: ${item.name} → ${topic.title}`,
              category: category
            });
          }
        });
      });
    });

    // Remove duplicates (same item appearing multiple times)
    const uniqueResults = results.reduce((acc, result) => {
      if (result.type === 'item') {
        const existing = acc.find(r => r.type === 'item' && r.itemId === result.itemId);
        if (!existing) acc.push(result);
      } else {
        acc.push(result);
      }
      return acc;
    }, [] as SearchResult[]);

    // Sort by relevance (exact matches first, then by type priority)
    return uniqueResults.sort((a, b) => {
      const aExact = a.title.toLowerCase() === lowerQuery;
      const bExact = b.title.toLowerCase() === lowerQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Type priority: item > category > topic > subtopic
      const typePriority = { item: 0, category: 1, topic: 2, subtopic: 3 };
      return typePriority[a.type] - typePriority[b.type];
    }).slice(0, 10); // Limit to 10 results
  }, [query, state]);

  useEffect(() => {
    setIsOpen(query.trim().length > 0 && searchResults.length > 0);
    setSelectedIndex(-1);
  }, [query, searchResults.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'item' && result.itemId) {
      onSelectItem(result.itemId);
      setQuery('');
      setIsOpen(false);
    } else if (result.type === 'category' && onSelectCategory) {
      onSelectCategory(result.id);
      setQuery('');
      setIsOpen(false);
    } else if (result.type === 'topic' || result.type === 'subtopic') {
      if (result.itemId) {
        onSelectItem(result.itemId);
        setQuery('');
        setIsOpen(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelect(searchResults[selectedIndex]);
        } else if (searchResults.length > 0) {
          handleSelect(searchResults[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'item':
        return <BookOpen size={16} className="text-indigo-600" />;
      case 'category':
        return <Tag size={16} className="text-purple-600" />;
      case 'topic':
        return <FileText size={16} className="text-blue-600" />;
      case 'subtopic':
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'item':
        return 'Goal';
      case 'category':
        return 'Category';
      case 'topic':
        return 'Topic';
      case 'subtopic':
        return 'Objective';
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search topics, categories, goals..."
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-full text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0 && searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          <div className="p-2">
            {searchResults.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className={`w-full flex items-start space-x-3 p-3 rounded-xl transition-colors text-left ${
                  index === selectedIndex
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                }`}
              >
                <div className={`mt-0.5 ${result.category?.color || 'bg-gray-200'} p-2 rounded-lg flex-shrink-0`}>
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {getTypeLabel(result.type)}
                    </span>
                    {result.category && (
                      <span className="text-xs text-gray-500 truncate">
                        {result.category.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {result.title}
                  </p>
                  {result.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {result.subtitle}
                    </p>
                  )}
                </div>
                <ArrowRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.trim().length > 0 && searchResults.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;

