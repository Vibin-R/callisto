'use client';

import React from 'react';
import { BookOpen, CheckCircle, Clock, Plus, BarChart3, TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { LearningState, LearningItem } from '../types';

interface DashboardProps {
  state: LearningState;
  onSelectItem: (id: string) => void;
  onAddItem: () => void;
  onFilterClick: (filter: 'all' | 'completed-topics' | 'categories') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onSelectItem, onAddItem, onFilterClick }) => {
  const calculateProgress = (item: LearningItem) => {
    if (item.topics.length === 0) return 0;
    const totalSubTopics = item.topics.reduce((acc, t) => acc + t.subTopics.length, 0);
    const completedSubTopics = item.topics.reduce((acc, t) => acc + t.subTopics.filter(st => st.isCompleted).length, 0);
    return totalSubTopics === 0 ? 0 : Math.round((completedSubTopics / totalSubTopics) * 100);
  };

  const stats = [
    { label: 'Active Goals', value: state.items.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Completed Topics', value: state.items.reduce((acc, i) => acc + i.topics.filter(t => t.isCompleted).length, 0), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Total categories', value: state.categories.length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const chartData = state.items.slice(0, 5).map(item => ({
    name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
    progress: calculateProgress(item),
    originalName: item.name
  }));

  const categoryData = state.categories.map(cat => ({
    name: cat.name,
    count: state.items.filter(i => i.categoryId === cat.id).length
  })).filter(c => c.count > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your learning journey and stay motivated.</p>
        </div>
        <button 
          onClick={onAddItem}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50"
        >
          <Plus size={20} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const filterMap: Record<number, 'all' | 'completed-topics' | 'categories'> = {
            0: 'all',
            1: 'completed-topics',
            2: 'categories'
          };
          const filter = filterMap[i];
          
          return (
            <button
              key={i}
              onClick={() => filter && onFilterClick(filter)}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all text-left cursor-pointer group"
            >
            <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} dark:opacity-80 ${stat.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
            </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{stat.value}</p>
            </button>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-500" />
              Progress Distribution (%)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-gray-700" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} className="dark:fill-gray-400" />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="progress" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <p>No goals yet to visualize.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">Items per Category</h3>
          </div>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <p>Add items to see distribution.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Goals</h3>
          <button onClick={onAddItem} className="text-indigo-600 text-sm font-medium hover:underline">View all</button>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {state.items.length > 0 ? (
            state.items.slice(0, 4).map((item) => {
              const progress = calculateProgress(item);
              const cat = state.categories.find(c => c.id === item.categoryId);
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
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{cat?.name}</p>
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
              <p>You haven't added any learning goals yet.</p>
              <button 
                onClick={onAddItem}
                className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Create your first one
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
