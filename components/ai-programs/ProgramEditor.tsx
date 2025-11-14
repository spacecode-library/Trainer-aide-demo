'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutEditor } from './WorkoutEditor';
import type { AIProgram } from '@/lib/types/ai-program';

interface ProgramEditorProps {
  program: AIProgram;
  onChange: (program: AIProgram) => void;
  onSave: (program: AIProgram) => void;
}

export function ProgramEditor({ program, onChange, onSave }: ProgramEditorProps) {
  const [editedProgram, setEditedProgram] = useState(program);

  const handleProgramChange = (field: keyof AIProgram, value: any) => {
    const updated = { ...editedProgram, [field]: value };
    setEditedProgram(updated);
    onChange(updated);
  };

  const handleWorkoutChange = (workoutId: string, updatedWorkout: any) => {
    // Update workout in workouts array
    const updatedWorkouts = editedProgram.workouts?.map(w =>
      w.id === workoutId ? updatedWorkout : w
    );

    const updated = { ...editedProgram, workouts: updatedWorkouts };
    setEditedProgram(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Program Metadata */}
      <Card className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-gray-100">
            Program Details
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program Name */}
            <div className="space-y-2">
              <Label htmlFor="program-name">Program Name</Label>
              <Input
                id="program-name"
                value={editedProgram.program_name}
                onChange={(e) => handleProgramChange('program_name', e.target.value)}
                placeholder="e.g., 8-Week Strength Builder"
                className="bg-white dark:bg-gray-900"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={editedProgram.status}
                onChange={(e) => handleProgramChange('status', e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wondrous-magenta"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Total Weeks */}
            <div className="space-y-2">
              <Label htmlFor="total-weeks">Duration (weeks)</Label>
              <Input
                id="total-weeks"
                type="number"
                min={1}
                max={52}
                value={editedProgram.total_weeks}
                onChange={(e) => handleProgramChange('total_weeks', parseInt(e.target.value))}
                className="bg-white dark:bg-gray-900"
              />
            </div>

            {/* Sessions Per Week */}
            <div className="space-y-2">
              <Label htmlFor="sessions-per-week">Sessions per Week</Label>
              <Input
                id="sessions-per-week"
                type="number"
                min={1}
                max={7}
                value={editedProgram.sessions_per_week}
                onChange={(e) => handleProgramChange('sessions_per_week', parseInt(e.target.value))}
                className="bg-white dark:bg-gray-900"
              />
            </div>

            {/* Session Duration */}
            <div className="space-y-2">
              <Label htmlFor="session-duration">Session Duration (minutes)</Label>
              <Input
                id="session-duration"
                type="number"
                min={15}
                max={180}
                value={editedProgram.session_duration_minutes}
                onChange={(e) => handleProgramChange('session_duration_minutes', parseInt(e.target.value))}
                className="bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedProgram.description || ''}
              onChange={(e) => handleProgramChange('description', e.target.value)}
              placeholder="Program overview and goals..."
              rows={4}
              className="bg-white dark:bg-gray-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workouts */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-gray-100">
          Workouts
        </h2>

        {editedProgram.workouts && editedProgram.workouts.length > 0 ? (
          <div className="space-y-4">
            {editedProgram.workouts.map((workout) => (
              <WorkoutEditor
                key={workout.id}
                workout={workout}
                onChange={(updatedWorkout) => handleWorkoutChange(workout.id, updatedWorkout)}
              />
            ))}
          </div>
        ) : (
          <Card className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No workouts found. Generate a program first or add workouts manually.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
