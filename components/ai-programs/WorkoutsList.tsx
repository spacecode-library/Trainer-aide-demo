'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseCard } from './ExerciseCard';
import type { AIProgram } from '@/lib/types/ai-program';

interface WorkoutsListProps {
  programId: string;
  program: AIProgram;
}

interface Workout {
  id: string;
  week_number: number;
  day_number: number;
  workout_name: string;
  description?: string;
  exercises: WorkoutExercise[];
}

interface WorkoutExercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  exercise_order: number;
  sets: number;
  reps_min?: number;
  reps_max?: number;
  target_rpe?: number;
  tempo?: string;
  rest_seconds?: number;
  coaching_cues?: string;
  notes?: string;
}

export function WorkoutsList({ programId, program }: WorkoutsListProps) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        setLoading(true);

        // Fetch real workouts from API
        const response = await fetch(`/api/ai-programs/${programId}/workouts`);
        if (!response.ok) {
          throw new Error('Failed to fetch workouts');
        }

        const data = await response.json();

        // Filter workouts for selected week
        const weekWorkouts = data.workouts.filter(
          (w: Workout) => w.week_number === selectedWeek
        );

        setWorkouts(weekWorkouts);
        // Auto-expand first workout
        setExpandedWorkouts(new Set([weekWorkouts[0]?.id].filter(Boolean)));
      } catch (err) {
        console.error('Failed to load workouts:', err);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, [programId, selectedWeek]);

  // Remove unused mock data
  /*
  const mockWorkouts: Workout[] = [
          {
            id: '1',
            week_number: selectedWeek,
            day_number: 1,
            workout_name: 'Full Body A',
            description: 'Focus on compound movements with progressive overload',
            exercises: [
              {
                id: '1',
                exercise_id: 'ex-1',
                exercise_name: 'Goblet Squat',
                exercise_order: 1,
                sets: 3,
                reps_min: 10,
                reps_max: 12,
                target_rpe: 7,
                tempo: '3-1-1-0',
                rest_seconds: 90,
                coaching_cues: 'Focus on depth and control. Keep chest up and core tight.',
              },
              {
                id: '2',
                exercise_id: 'ex-2',
                exercise_name: 'Dumbbell Bench Press',
                exercise_order: 2,
                sets: 3,
                reps_min: 10,
                reps_max: 12,
                target_rpe: 7,
                tempo: '3-0-1-0',
                rest_seconds: 90,
                coaching_cues: 'Keep elbows at 45° angle. Full range of motion.',
              },
              {
                id: '3',
                exercise_id: 'ex-3',
                exercise_name: 'Dumbbell Bent-Over Row',
                exercise_order: 3,
                sets: 3,
                reps_min: 10,
                reps_max: 12,
                target_rpe: 7,
                tempo: '3-1-1-0',
                rest_seconds: 90,
                coaching_cues: 'Squeeze shoulder blades together at the top.',
              },
              {
                id: '4',
                exercise_id: 'ex-4',
                exercise_name: 'Dumbbell Romanian Deadlift',
                exercise_order: 4,
                sets: 3,
                reps_min: 10,
                reps_max: 12,
                target_rpe: 7,
                tempo: '3-1-1-0',
                rest_seconds: 90,
                coaching_cues: 'Hinge at hips, keep back neutral, feel hamstring stretch.',
              },
              {
                id: '5',
                exercise_id: 'ex-5',
                exercise_name: 'Plank',
                exercise_order: 5,
                sets: 3,
                reps_min: 30,
                reps_max: 45,
                target_rpe: 6,
                tempo: 'HOLD',
                rest_seconds: 60,
                coaching_cues: 'Maintain neutral spine. Engage core and glutes.',
              },
            ],
          },
          {
            id: '2',
            week_number: selectedWeek,
            day_number: 2,
            workout_name: 'Full Body B',
            description: 'Variation movements with different stimulus',
            exercises: [
              {
                id: '6',
                exercise_id: 'ex-6',
                exercise_name: 'Dumbbell Lunges',
                exercise_order: 1,
                sets: 3,
                reps_min: 10,
                reps_max: 12,
                target_rpe: 7,
                tempo: '3-0-1-0',
                rest_seconds: 90,
                coaching_cues: 'Step forward, drop back knee toward floor. Push through front heel.',
              },
              {
                id: '7',
                exercise_id: 'ex-7',
                exercise_name: 'Dumbbell Shoulder Press',
                exercise_order: 2,
                sets: 3,
                reps_min: 10,
                reps_max: 12,
                target_rpe: 7,
                tempo: '3-0-1-0',
                rest_seconds: 90,
                coaching_cues: 'Press straight overhead. Avoid arching lower back.',
              },
              {
                id: '8',
                exercise_id: 'ex-8',
                exercise_name: 'Dumbbell Single-Arm Row',
                exercise_order: 3,
                sets: 3,
                reps_min: 10,
                reps_max: 12,
                target_rpe: 7,
                tempo: '3-1-1-0',
                rest_seconds: 60,
                coaching_cues: 'Support on bench. Pull elbow toward hip.',
              },
            ],
          },
          {
            id: '3',
            week_number: selectedWeek,
            day_number: 3,
            workout_name: 'Full Body C',
            description: 'Metabolic focus with higher rep ranges',
            exercises: [
              {
                id: '9',
                exercise_id: 'ex-9',
                exercise_name: 'Dumbbell Step-Ups',
                exercise_order: 1,
                sets: 3,
                reps_min: 12,
                reps_max: 15,
                target_rpe: 6,
                tempo: '2-0-1-0',
                rest_seconds: 75,
                coaching_cues: 'Drive through heel on box. Full hip extension at top.',
              },
              {
                id: '10',
                exercise_id: 'ex-10',
                exercise_name: 'Dumbbell Floor Press',
                exercise_order: 2,
                sets: 3,
                reps_min: 12,
                reps_max: 15,
                target_rpe: 6,
                tempo: '2-0-1-0',
                rest_seconds: 75,
                coaching_cues: 'Tap elbows to floor lightly between reps.',
              },
            ],
          },
        ];

        setWorkouts(mockWorkouts);
        // Auto-expand first workout
        setExpandedWorkouts(new Set([mockWorkouts[0]?.id].filter(Boolean)));
      } catch (err) {
        console.error('Failed to load workouts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, [programId, selectedWeek]);
  */

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkouts(prev => {
      const next = new Set(prev);
      if (next.has(workoutId)) {
        next.delete(workoutId);
      } else {
        next.add(workoutId);
      }
      return next;
    });
  };

  const getTotalSets = (exercises: WorkoutExercise[]) => {
    return exercises.reduce((sum, ex) => sum + ex.sets, 0);
  };

  const getEstimatedDuration = (exercises: WorkoutExercise[]) => {
    // Rough estimate: 3 min per set + rest time
    const totalSets = getTotalSets(exercises);
    const avgRestTime = exercises.reduce((sum, ex) => sum + (ex.rest_seconds || 60), 0) / exercises.length;
    return Math.round((totalSets * 180 + totalSets * avgRestTime) / 60); // minutes
  };

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: program.total_weeks }, (_, i) => i + 1).map((week) => (
          <Button
            key={week}
            onClick={() => setSelectedWeek(week)}
            variant={selectedWeek === week ? 'default' : 'outline'}
            className={
              selectedWeek === week
                ? 'bg-wondrous-primary hover:bg-purple-700 text-white'
                : ''
            }
          >
            Week {week}
          </Button>
        ))}
      </div>

      {/* Workouts */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wondrous-magenta mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading workouts...</p>
        </div>
      ) : workouts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No workouts found for this week</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => {
            const isExpanded = expandedWorkouts.has(workout.id);

            return (
              <Card key={workout.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleWorkout(workout.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">
                          Day {workout.day_number}: {workout.workout_name}
                        </CardTitle>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {getEstimatedDuration(workout.exercises)} min
                        </span>
                      </div>
                      {workout.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {workout.description}
                        </p>
                      )}
                      {!isExpanded && (
                        <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{workout.exercises.length} exercises</span>
                          <span>{getTotalSets(workout.exercises)} sets</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkout(workout.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                      {workout.exercises.map((exercise) => (
                        <ExerciseCard key={exercise.id} exercise={exercise} />
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Total Volume:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getTotalSets(workout.exercises)} sets
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Estimated Duration:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getEstimatedDuration(workout.exercises)} minutes
                        </span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
