'use client';

import { CheckCircle2, XCircle, Sparkles, Clock, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { GenerationResult } from './ProgramGeneratorWizard';

interface GenerationResultsProps {
  result: GenerationResult;
  onCreateAnother: () => void;
  onViewProgram: () => void;
  onBack: () => void;
}

export function GenerationResults({
  result,
  onCreateAnother,
  onViewProgram,
  onBack,
}: GenerationResultsProps) {
  if (!result.success) {
    return (
      <Card className="border-red-500">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
                Generation Failed
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Something went wrong while generating your program
              </p>
            </div>

            {/* Error Message */}
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Error:</strong> {result.error}
                </p>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <div className="text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Suggestions:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>Try adding more equipment options</li>
                <li>Reduce program duration or frequency</li>
                <li>Check that client profile has valid data</li>
                <li>Try again in a few moments</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={onBack}>
                ← Back
              </Button>
              <Button
                onClick={onCreateAnother}
                className="bg-wondrous-primary hover:bg-purple-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state
  const program = result.program;
  const generationLog = result.generation_log;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-500 bg-green-50/50 dark:bg-green-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
                Program Generated Successfully!
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {program?.program_name || 'Your training program'} has been created and saved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} className="text-wondrous-magenta" />
            Program Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {program?.total_weeks || result.workouts_count} weeks
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Frequency</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {program?.sessions_per_week || 3}x/week
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Workouts</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {result.workouts_count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exercises</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {result.exercises_count || 0}
              </p>
            </div>
          </div>

          {/* Movement Balance */}
          {program?.movement_balance_summary && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Movement Balance:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(program.movement_balance_summary).map(([pattern, count]) => (
                  <div key={pattern} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {pattern.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {count as number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Rationale */}
      {program?.ai_rationale && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={20} className="text-wondrous-magenta" />
              AI Rationale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              &quot;{program.ai_rationale}&quot;
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generation Metadata */}
      {generationLog && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generation Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Model</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Claude Sonnet 4.5
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Tokens Used</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {generationLog.tokens_used?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  ({generationLog.input_tokens?.toLocaleString()} in /{' '}
                  {generationLog.output_tokens?.toLocaleString()} out)
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <DollarSign size={14} />
                  Cost
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  ${generationLog.cost_usd?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Clock size={14} />
                  Time
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {generationLog.latency_ms
                    ? `${Math.round(generationLog.latency_ms / 1000)}s`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Filtering Stats */}
      {result.filtering_stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exercise Filtering</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total available:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {result.filtering_stats.total_exercises || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">After equipment filter:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {result.filtering_stats.after_equipment_filter || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">After experience filter:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {result.filtering_stats.after_experience_filter || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Final count:</span>
                <span className="font-medium text-wondrous-magenta">
                  {result.filtering_stats.final_count || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCreateAnother}>
          ← Create Another
        </Button>
        <Button
          onClick={onViewProgram}
          className="bg-wondrous-primary hover:bg-purple-700 text-white"
        >
          View Program →
        </Button>
      </div>
    </div>
  );
}
