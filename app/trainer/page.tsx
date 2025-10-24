"use client";

import Link from 'next/link';
import { useTemplateStore } from '@/lib/stores/template-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useUserStore } from '@/lib/stores/user-store';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Dumbbell, TrendingUp, Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function TrainerDashboard() {
  const templates = useTemplateStore((state) => state.templates);
  const { sessions } = useSessionStore();
  const { currentUser } = useUserStore();

  // Calculate stats
  const assignedTemplates = templates.length; // In demo, all templates are "assigned"
  const today = new Date().toDateString();
  const sessionsToday = sessions.filter(s => new Date(s.startedAt).toDateString() === today).length;
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const sessionsThisWeek = sessions.filter(s => new Date(s.startedAt) >= thisWeekStart).length;
  const completedSessions = sessions.filter(s => s.completed && s.overallRpe);
  const averageRpe = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.overallRpe || 0), 0) / completedSessions.length)
    : 0;

  // Get recent completed sessions
  const recentSessions = sessions
    .filter(s => s.completed)
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-1 dark:text-gray-100 mb-2">
          Hey {currentUser.firstName}! 👋
        </h1>
        <p className="text-body-sm text-gray-600 dark:text-gray-400">
          Ready to train your clients today?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        <StatCard
          title="Templates"
          value={assignedTemplates}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Today"
          value={sessionsToday}
          icon={Dumbbell}
          color="magenta"
        />
        <StatCard
          title="This Week"
          value={sessionsThisWeek}
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="Avg RPE"
          value={averageRpe > 0 ? `${averageRpe}/10` : 'N/A'}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading-2 dark:text-gray-100">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Link href="/trainer/sessions/new" className="group">
            <div className="relative overflow-hidden backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-blue-200/50 dark:border-blue-800/50 rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-bl from-blue-500/10 to-transparent opacity-50" />
              <div className="relative flex flex-col items-center gap-2 lg:gap-3 text-center">
                <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="text-wondrous-blue" size={22} strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm lg:text-base">Start New Session</span>
              </div>
            </div>
          </Link>
          <Link href="/trainer/templates" className="group">
            <div className="relative overflow-hidden backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-pink-200/50 dark:border-pink-800/50 rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-bl from-pink-500/10 to-transparent opacity-50" />
              <div className="relative flex flex-col items-center gap-2 lg:gap-3 text-center">
                <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="text-wondrous-magenta" size={22} strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm lg:text-base">View Templates</span>
              </div>
            </div>
          </Link>
          <Link href="/trainer/sessions" className="group">
            <div className="relative overflow-hidden backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-orange-200/50 dark:border-orange-800/50 rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-bl from-orange-500/10 to-transparent opacity-50" />
              <div className="relative flex flex-col items-center gap-2 lg:gap-3 text-center">
                <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Dumbbell className="text-wondrous-orange" size={22} strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm lg:text-base">My Sessions</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading-2 dark:text-gray-100">Recent Sessions</h2>
          <Link href="/trainer/sessions">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {recentSessions.length > 0 ? (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {session.client?.firstName} {session.client?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {session.template.name}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {session.completedAt && format(new Date(session.completedAt), 'MMM d, yyyy')}
                        </span>
                        <span>
                          {session.duration ? `${Math.floor(session.duration / 60)} min` : 'N/A'}
                        </span>
                        <span>
                          RPE: {session.overallRpe}/10
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Completed
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <Dumbbell className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium mb-2">No sessions yet</p>
              <p className="text-sm mb-4">Start your first training session to get going</p>
              <Link href="/trainer/sessions/new">
                <Button>Start Session</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
