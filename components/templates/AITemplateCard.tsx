'use client';

import { useState } from 'react';
import { Calendar, Clock, Dumbbell, Sparkles, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssignClientModal } from '../ai-programs/AssignClientModal';
import { WorkoutSelectorModal } from './WorkoutSelectorModal';
import type { AIProgram } from '@/lib/types/ai-program';

interface AITemplateCardProps {
  template: AIProgram;
  onUpdate?: () => void;
}

export function AITemplateCard({ template, onUpdate }: AITemplateCardProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      strength: 'Strength',
      hypertrophy: 'Muscle Gain',
      endurance: 'Endurance',
      fat_loss: 'Fat Loss',
      general_fitness: 'General Fitness',
    };
    return labels[goal] || goal;
  };

  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    };
    return labels[level] || level;
  };

  const totalSessions = template.total_weeks * template.sessions_per_week;

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {template.program_name}
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-wondrous-magenta dark:text-purple-300 text-xs font-medium rounded-full flex-shrink-0">
                  <Sparkles size={12} />
                  AI
                </span>
              </div>
              {template.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {template.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {template.total_weeks} {template.total_weeks === 1 ? 'week' : 'weeks'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Dumbbell size={16} className="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {template.sessions_per_week}x/week
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {template.session_duration_minutes || 60} min
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {getExperienceLabel(template.experience_level)}
              </span>
            </div>
          </div>

          {/* Goal & Movement Balance */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Goal:</span>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {getGoalLabel(template.primary_goal)}
              </span>
            </div>

            {template.movement_balance_summary && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Patterns:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(template.movement_balance_summary).map(([pattern, count]) => (
                    count && count > 0 && (
                      <span
                        key={pattern}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {pattern}: {count}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Total Sessions Info */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-center text-purple-900 dark:text-purple-200">
              <span className="font-semibold">{totalSessions}</span> total workouts •
              <span className="font-semibold"> AI</span> generated
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWorkoutSelector(true)}
              className="flex-1"
            >
              Use for Session
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAssignModal(true)}
              className="flex-1 bg-wondrous-primary hover:bg-purple-700 text-white"
            >
              Assign to Client
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showAssignModal && (
        <AssignClientModal
          programId={template.id}
          programName={template.program_name}
          onClose={() => setShowAssignModal(false)}
          onAssigned={() => {
            setShowAssignModal(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {showWorkoutSelector && (
        <WorkoutSelectorModal
          program={template}
          onClose={() => setShowWorkoutSelector(false)}
        />
      )}
    </>
  );
}
