'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GripVertical, ChevronDown, ChevronUp, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { AIExercise } from '@/lib/types/ai-program';

interface ExerciseEditorProps {
  exercise: AIExercise;
  onChange: (exercise: AIExercise) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function ExerciseEditor({ exercise, onChange, onRemove, onMoveUp, onMoveDown }: ExerciseEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof AIExercise, value: any) => {
    onChange({ ...exercise, [field]: value });
  };

  return (
    <Card className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4 space-y-3">
        {/* Exercise Header */}
        <div className="flex items-start gap-3">
          <div className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pt-1">
            <GripVertical size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <Input
                value={exercise.exercise_name}
                onChange={(e) => handleChange('exercise_name', e.target.value)}
                className="font-medium bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                placeholder="Exercise name"
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                {onMoveUp && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMoveUp}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <ArrowUp size={16} />
                  </Button>
                )}
                {onMoveDown && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMoveDown}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <ArrowDown size={16} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Sets:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">{exercise.sets || 0}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Reps:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">{exercise.reps || '0'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Tempo:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">{exercise.tempo || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Rest:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">{exercise.rest_seconds || 0}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="pl-9 space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {/* Sets, Reps, Tempo, Rest */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`sets-${exercise.id}`} className="text-xs">Sets</Label>
                <Input
                  id={`sets-${exercise.id}`}
                  type="number"
                  min={1}
                  max={10}
                  value={exercise.sets}
                  onChange={(e) => handleChange('sets', parseInt(e.target.value))}
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`reps-${exercise.id}`} className="text-xs">Reps</Label>
                <Input
                  id={`reps-${exercise.id}`}
                  value={exercise.reps}
                  onChange={(e) => handleChange('reps', e.target.value)}
                  placeholder="e.g., 8-12"
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`tempo-${exercise.id}`} className="text-xs">Tempo</Label>
                <Input
                  id={`tempo-${exercise.id}`}
                  value={exercise.tempo || ''}
                  onChange={(e) => handleChange('tempo', e.target.value)}
                  placeholder="e.g., 3-1-1-0"
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`rest-${exercise.id}`} className="text-xs">Rest (sec)</Label>
                <Input
                  id={`rest-${exercise.id}`}
                  type="number"
                  min={0}
                  max={600}
                  value={exercise.rest_seconds}
                  onChange={(e) => handleChange('rest_seconds', parseInt(e.target.value))}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            {/* RIR */}
            <div className="space-y-1">
              <Label htmlFor={`rir-${exercise.id}`} className="text-xs">RIR (Reps in Reserve)</Label>
              <Input
                id={`rir-${exercise.id}`}
                value={exercise.rir || ''}
                onChange={(e) => handleChange('rir', e.target.value)}
                placeholder="e.g., 2-3"
                className="bg-white dark:bg-gray-800"
              />
            </div>

            {/* Movement Pattern & Primary Muscles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`movement-${exercise.id}`} className="text-xs">Movement Pattern</Label>
                <Input
                  id={`movement-${exercise.id}`}
                  value={exercise.movement_pattern || ''}
                  onChange={(e) => handleChange('movement_pattern', e.target.value)}
                  placeholder="e.g., push, pull, squat"
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`muscles-${exercise.id}`} className="text-xs">Primary Muscles</Label>
                <Input
                  id={`muscles-${exercise.id}`}
                  value={exercise.primary_muscles?.join(', ') || ''}
                  onChange={(e) => handleChange('primary_muscles', e.target.value.split(',').map(m => m.trim()))}
                  placeholder="e.g., chest, triceps"
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Coaching Cues */}
            <div className="space-y-1">
              <Label htmlFor={`cues-${exercise.id}`} className="text-xs">Coaching Cues</Label>
              <Textarea
                id={`cues-${exercise.id}`}
                value={exercise.coaching_cues?.join('\n') || ''}
                onChange={(e) => handleChange('coaching_cues', e.target.value.split('\n').filter(c => c.trim()))}
                placeholder="Enter coaching cues (one per line)"
                rows={3}
                className="bg-white dark:bg-gray-800 text-sm"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor={`notes-${exercise.id}`} className="text-xs">Exercise Notes</Label>
              <Textarea
                id={`notes-${exercise.id}`}
                value={exercise.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes, modifications, or progressions..."
                rows={2}
                className="bg-white dark:bg-gray-800 text-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
