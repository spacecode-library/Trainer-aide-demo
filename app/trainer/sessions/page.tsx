"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useSessionStore } from '@/lib/stores/session-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDuration } from '@/lib/utils/generators';
import { Dumbbell, Play, Trash2, Calendar, Clock, TrendingUp, Plus, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

type TabType = 'in_progress' | 'completed';

export default function MySessions() {
  const { sessions, deleteSession } = useSessionStore();
  const [activeTab, setActiveTab] = useState<TabType>('in_progress');

  const inProgressSessions = sessions.filter((s) => !s.completed);
  const completedSessions = sessions
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

  const displaySessions = activeTab === 'in_progress' ? inProgressSessions : completedSessions;

  const handleDelete = (sessionId: string, sessionName: string) => {
    if (confirm(`Are you sure you want to delete "${sessionName}"?`)) {
      deleteSession(sessionId);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-heading-1 mb-2">My Sessions</h1>
            <p className="text-body-sm text-gray-600">View and manage your training sessions</p>
          </div>
          <Link href="/trainer/sessions/new">
            <Button className="gap-2">
              <Plus size={20} />
              <span className="hidden sm:inline">New Session</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('in_progress')}
          className={cn(
            'px-4 py-3 font-medium text-sm transition-colors relative',
            activeTab === 'in_progress'
              ? 'text-wondrous-primary'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          In Progress
          {inProgressSessions.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-wondrous-primary text-white text-xs rounded-full">
              {inProgressSessions.length}
            </span>
          )}
          {activeTab === 'in_progress' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wondrous-primary"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={cn(
            'px-4 py-3 font-medium text-sm transition-colors relative',
            activeTab === 'completed'
              ? 'text-wondrous-primary'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Completed
          {completedSessions.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-gray-300 text-gray-700 text-xs rounded-full">
              {completedSessions.length}
            </span>
          )}
          {activeTab === 'completed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wondrous-primary"></div>
          )}
        </button>
      </div>

      {/* Sessions List */}
      {displaySessions.length > 0 ? (
        <div className="space-y-4">
          {displaySessions.map((session) => {
            const completedExercises = session.blocks.reduce(
              (sum, block) => sum + block.exercises.filter((ex) => ex.completed).length,
              0
            );
            const totalExercises = session.blocks.reduce(
              (sum, block) => sum + block.exercises.length,
              0
            );
            const progressPercentage = (completedExercises / totalExercises) * 100;

            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                      session.completed ? 'bg-green-100' : 'bg-wondrous-blue-light'
                    )}>
                      <Dumbbell
                        className={session.completed ? 'text-green-600' : 'text-wondrous-dark-blue'}
                        size={24}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Status */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">
                            {session.sessionName}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600">
                            {session.client && (
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {session.client.firstName} {session.client.lastName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {format(new Date(session.startedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <Badge variant={session.completed ? 'success' : 'default'}>
                          {session.completed ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>

                      {/* Progress Bar (for in-progress sessions) */}
                      {!session.completed && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>
                              {completedExercises} of {totalExercises} exercises
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-wondrous-primary h-full rounded-full transition-all"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Stats (for completed sessions) */}
                      {session.completed && (
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                          {session.duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDuration(session.duration)}
                            </span>
                          )}
                          {session.overallRpe && (
                            <span className="flex items-center gap-1">
                              <TrendingUp size={14} />
                              RPE {session.overallRpe}/10
                            </span>
                          )}
                          {session.completedAt && (
                            <span>
                              Completed: {format(new Date(session.completedAt), 'h:mm a')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Notes Preview (for completed sessions) */}
                      {session.completed && session.notes && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 italic">
                          &quot;{session.notes}&quot;
                        </p>
                      )}

                      {/* Template Info */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{session.template.name}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {session.signOffMode.replace('_', ' ')} mode
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!session.completed ? (
                        <Link href={`/trainer/sessions/${session.id}`}>
                          <Button size="sm" className="whitespace-nowrap gap-2">
                            <Play size={16} />
                            Resume
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/trainer/sessions/${session.id}/view`}>
                          <Button size="sm" variant="outline" className="whitespace-nowrap">
                            View Details
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(session.id, session.sessionName)}
                        className="text-red-600 hover:text-red-700 whitespace-nowrap gap-2"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Dumbbell}
          title={
            activeTab === 'in_progress'
              ? 'No sessions in progress'
              : 'No completed sessions'
          }
          description={
            activeTab === 'in_progress'
              ? 'Start a new training session to get going'
              : 'Completed sessions will appear here'
          }
          action={
            activeTab === 'in_progress' ? (
              <Link href="/trainer/sessions/new">
                <Button>
                  <Plus size={20} className="mr-2" />
                  Start New Session
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
