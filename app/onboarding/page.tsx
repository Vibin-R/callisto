'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Users, Building2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

type UseCase = 'personal' | 'team' | 'organization';

export default function OnboardingPage() {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token } = useAuth();
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('useAuth',token);
    
    if (!selectedUseCase) {
      showAlert({
        type: 'warning',
        title: 'Selection Required',
        message: 'Please select how you plan to use Callisto.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ useCase: selectedUseCase }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save onboarding data');
      }

      showAlert({
        type: 'success',
        title: 'Welcome to Callisto!',
        message: 'Your setup is complete. Redirecting to your dashboard...',
      });

      // Refresh auth state and redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Setup Failed',
        message: error.message || 'Failed to complete setup. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const useCases = [
    {
      id: 'personal' as UseCase,
      title: 'Personal',
      description: 'Set individual KPIs, log hours, track progress.',
      icon: User,
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      id: 'team' as UseCase,
      title: 'Team',
      description: 'Collaborate and log time with your team',
      icon: Users,
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      id: 'organization' as UseCase,
      title: 'Organization',
      description: 'Manage teams, roles & targets across your organization.',
      icon: Building2,
      gradient: 'from-purple-400 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <BookOpen className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Callisto</span>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            How are you planning to use Callisto?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            We'll streamline your setup experience accordingly.
          </p>
        </div>

        {/* Use Case Cards */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;
              const isSelected = selectedUseCase === useCase.id;
              
              return (
                <button
                  key={useCase.id}
                  type="button"
                  onClick={() => setSelectedUseCase(useCase.id)}
                  className={`relative p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all text-left hover:shadow-lg ${
                    isSelected
                      ? 'border-emerald-500 dark:border-emerald-400 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Radio Button */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-500 dark:bg-emerald-400'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>

                  {/* Icon with gradient background */}
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-6 shadow-sm`}>
                    <Icon className="text-white" size={36} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {useCase.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-12">
            <button
              type="submit"
              disabled={loading || !selectedUseCase}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 px-12 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

