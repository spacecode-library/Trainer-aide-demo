'use client';

import { Loader2, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GenerationProgressProps {
  progress: string[];
}

const PROGRESS_STEPS = [
  'Filtering exercises',
  'Analyzing movement patterns',
  'Generating workouts',
  'Saving to database',
];

export function GenerationProgress({ progress }: GenerationProgressProps) {
  return (
    <Card className="border-wondrous-magenta">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-wondrous-magenta animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
              Generating Your Program
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Claude Sonnet 4.5 is creating your personalized program...
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-md mx-auto space-y-3">
            {PROGRESS_STEPS.map((step, index) => {
              const isCompleted = progress.some((p) => p.toLowerCase().includes(step.toLowerCase()));
              const isCurrent =
                !isCompleted &&
                (index === 0 || progress.some((p) => p.toLowerCase().includes(PROGRESS_STEPS[index - 1].toLowerCase())));

              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : isCurrent
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 text-wondrous-magenta animate-spin flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : isCurrent
                        ? 'text-wondrous-magenta'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time Estimate */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            This typically takes 1-2 minutes
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center justify-center gap-2">
              <AlertTriangle size={16} />
              Do not close this window
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
