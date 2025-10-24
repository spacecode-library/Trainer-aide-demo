"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUserStore } from '@/lib/stores/user-store';
import { MOCK_USERS } from '@/lib/mock-data/users';
import { Dumbbell, UserCircle, Building2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function Home() {
  const router = useRouter();
  const { login, isAuthenticated } = useUserStore();

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const { currentRole } = useUserStore.getState();
      if (currentRole === 'studio_owner') router.push('/studio-owner');
      else if (currentRole === 'trainer') router.push('/trainer');
      else if (currentRole === 'client') router.push('/client');
    }
  }, [isAuthenticated, router]);

  const handleLogin = (email: string) => {
    const success = login(email);
    if (success) {
      const { currentRole } = useUserStore.getState();
      // Redirect to appropriate dashboard
      if (currentRole === 'studio_owner') router.push('/studio-owner');
      else if (currentRole === 'trainer') router.push('/trainer');
      else if (currentRole === 'client') router.push('/client');
    }
  };

  const getRoleIcon = (role: string, size = 40) => {
    switch (role) {
      case 'studio_owner':
        return <Building2 size={size} className="text-white" />;
      case 'trainer':
        return <Dumbbell size={size} className="text-white" />;
      case 'client':
        return <UserCircle size={size} className="text-white" />;
      default:
        return <UserCircle size={size} className="text-white" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'studio_owner':
        return 'border-blue-200 hover:border-blue-400 hover:shadow-blue-200/50 dark:border-blue-800 dark:hover:border-blue-600';
      case 'trainer':
        return 'border-pink-200 hover:border-pink-400 hover:shadow-pink-200/50 dark:border-pink-800 dark:hover:border-pink-600';
      case 'client':
        return 'border-orange-200 hover:border-orange-400 hover:shadow-orange-200/50 dark:border-orange-800 dark:hover:border-orange-600';
      default:
        return 'border-gray-200 hover:border-gray-400 hover:shadow-gray-200/50';
    }
  };

  const getRoleIconBg = (role: string) => {
    switch (role) {
      case 'studio_owner':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'trainer':
        return 'bg-gradient-to-br from-pink-500 to-pink-600';
      case 'client':
        return 'bg-gradient-to-br from-orange-500 to-orange-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'studio_owner':
        return 'Studio Owner';
      case 'trainer':
        return 'Trainer';
      case 'client':
        return 'Client';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative w-64 h-20 mx-auto mb-6">
            <Image
              src="/images/all-wondrous-logo.svg"
              alt="All Wondrous"
              fill
              sizes="256px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 font-heading mb-3">
            Trainer Aide Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select a user to explore the platform
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Interactive demo with full mock data for testing
          </p>
        </div>

        {/* User Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {MOCK_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user.email)}
              className={cn(
                "relative overflow-hidden backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl active:scale-[0.98] text-left group",
                getRoleColor(user.role)
              )}
            >
              {/* Background gradient accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-gray-100/50 to-transparent dark:from-gray-700/30 rounded-bl-full" />

              <div className="relative flex items-start gap-4">
                {/* User Avatar */}
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg", getRoleIconBg(user.role))}>
                  {getRoleIcon(user.role, 32)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {user.firstName} {user.lastName}
                    </h3>
                    <ArrowRight
                      size={20}
                      className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all flex-shrink-0"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize mb-1">
                    {getRoleLabel(user.role)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Features Info */}
        <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Demo Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building2 size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Studio Owner</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Create templates, assign to studios, track all sessions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Dumbbell size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Trainer</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Run sessions, track progress with RPE scoring
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <UserCircle size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Client</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                View session history, workout details, progress notes
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This is a demo environment with mock data. All changes are stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
