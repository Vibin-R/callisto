'use client';

import { useAuth } from "@/contexts/AuthContext";
import { BookOpen } from "lucide-react";

export default function ProfilePage() {
    const { user,logout  } = useAuth();
    if (!user) {
        return <div>Loading...</div>;
    }
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="">
                {/* Logo - Top Left */}
                <div className="absolute top-8 left-8 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <BookOpen className="text-white" size={18} />
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">Callisto</span>
                </div>
            </div>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{user.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{user.email}</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{user.useCase}</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{user.onboardingCompleted ? 'Onboarding Completed' : 'Onboarding Not Completed'}</p>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md" onClick={() => logout()}>Logout</button>
                </div>
            </div>
        </div>
    );
}