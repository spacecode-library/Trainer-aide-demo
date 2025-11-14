'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MovementBalanceChart } from './MovementBalanceChart';
import type { AIProgram } from '@/lib/types/ai-program';

interface ProgramOverviewProps {
  program: AIProgram;
}

export function ProgramOverview({ program }: ProgramOverviewProps) {
  const getGoalLabel = (goal?: string) => {
    const labels: Record<string, string> = {
      strength: 'Strength',
      hypertrophy: 'Muscle Gain',
      endurance: 'Endurance',
      fat_loss: 'Fat Loss',
      general_fitness: 'General Fitness',
    };
    return goal ? labels[goal] || goal : 'Not set';
  };

  const getExperienceLabel = (level?: string) => {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    };
    return level ? labels[level] || level : 'Not set';
  };

  return (
    <div className="space-y-6">
      {/* Program Details */}
      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {program.total_weeks} weeks
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Frequency</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {program.sessions_per_week}x per week
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Session Duration</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {program.session_duration_minutes} min
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Workouts</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {program.total_weeks * program.sessions_per_week}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Primary Goal</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {getGoalLabel(program.primary_goal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Experience Level</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {getExperienceLabel(program.experience_level)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Rationale */}
      {program.ai_rationale && (
        <Card>
          <CardHeader>
            <CardTitle>AI Rationale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              &quot;{program.ai_rationale}&quot;
            </p>
          </CardContent>
        </Card>
      )}

      {/* Movement Balance */}
      {program.movement_balance_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Movement Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <MovementBalanceChart balance={program.movement_balance_summary} />
          </CardContent>
        </Card>
      )}

      {/* Equipment Required - commented out as available_equipment is not stored in AIProgram */}
      {/* {program.available_equipment && program.available_equipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Equipment Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {program.available_equipment.map((equipment) => (
                <div
                  key={equipment}
                  className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                >
                  {equipment.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Generation Metadata */}
      {program.ai_model && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generation Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">AI Model:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {program.ai_model === 'claude-sonnet-4-5-20250929' ? 'Claude Sonnet 4.5' : program.ai_model}
                </span>
              </div>
              {/* Commented out - these fields don't exist on AIProgram type */}
              {/* {program.tokens_used && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tokens Used:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {program.tokens_used.toLocaleString()}
                  </span>
                </div>
              )}
              {program.generation_cost_usd && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Generation Cost:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${program.generation_cost_usd.toFixed(2)}
                  </span>
                </div>
              )}
              {program.generation_time_ms && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Generation Time:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {Math.round(program.generation_time_ms / 1000)}s
                  </span>
                </div>
              )} */}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
