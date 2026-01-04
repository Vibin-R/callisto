'use client';

import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Palette, Bell, Shield, User, Database, Lock, Users } from 'lucide-react';
import { Select, MenuItem, FormControl } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'notifications' | 'personalization' | 'data' | 'security' | 'account';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  if (!isOpen) return null;

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: SettingsIcon },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'personalization' as SettingsTab, label: 'Personalization', icon: Palette },
    { id: 'data' as SettingsTab, label: 'Data controls', icon: Database },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'account' as SettingsTab, label: 'Account', icon: User },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="w-20 sm:w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl hidden sm:block font-bold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">General</h3>
                  <p className="text-gray-500 dark:text-gray-400">Manage your general application settings</p>
                </div>

                <div className="space-y-6">
                  {/* Appearance */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Appearance
                    </label>
                    <FormControl fullWidth>
                      <Select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          p:0,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'inherit',
                          },
                        }}
                        size="small"
                      >
                        <MenuItem value="system">System</MenuItem>
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Language
                    </label>
                    <FormControl fullWidth>
                      <Select
                        defaultValue="auto"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          p:0,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'inherit',
                          },
                        }}
                        size="small"
                      >
                        <MenuItem value="auto">Auto-detect</MenuItem>
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h3>
                  <p className="text-gray-500 dark:text-gray-400">Manage your notification preferences</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your goals</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                       <input type="checkbox" className="sr-only peer " defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Push notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about goal deadlines</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personalization' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personalization</h3>
                  <p className="text-gray-500 dark:text-gray-400">Customize your experience</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Accent color
                    </label>
                    <FormControl fullWidth>
                      <Select
                        defaultValue="default"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          p:0,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'inherit',
                          },
                        }}
                        size="small"
                      >
                        <MenuItem value="default">Default</MenuItem>
                        <MenuItem value="blue">Blue</MenuItem>
                        <MenuItem value="purple">Purple</MenuItem>
                        <MenuItem value="green">Green</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Data controls</h3>
                  <p className="text-gray-500 dark:text-gray-400">Manage your data and privacy</p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Export your data</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Download all your goals and progress data</p>
                    <button className="px-3 py-1 text-xs sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Export Data
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Delete all data</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Permanently delete all your goals and data</p>
                    <button className="px-3 py-1 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Delete All Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security</h3>
                  <p className="text-gray-500 dark:text-gray-400">Manage your security settings</p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Change password</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Update your account password</p>
                    <button className="px-3 py-1 text-xs sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account</h3>
                  <p className="text-gray-500 dark:text-gray-400">Manage your account settings</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Display name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name || ''}
                      className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

