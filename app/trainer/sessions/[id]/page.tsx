"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSessionStore } from '@/lib/stores/session-store';
import { getExerciseById } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SessionTimer } from '@/components/session/SessionTimer';
import { RPEPicker } from '@/components/session/RPEPicker';
import { SessionCompletionModal } from '@/components/session/SessionCompletionModal';
import { SessionExercise, SignOffMode } from '@/lib/types';
import { ChevronRight, CheckCircle2, Circle, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/hooks/use-toast';

export default function SessionRunner() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { toast } = useToast();

  const { sessions, updateExercise, updateBlock, completeSession } = useSessionStore();
  const session = sessions.find((s) => s.id === sessionId);

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Redirect if session not found or already completed
  useEffect(() => {
    if (!session || session.completed) {
      router.push('/trainer/sessions');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  const currentBlock = session.blocks[currentBlockIndex];
  const currentExercise = currentBlock?.exercises[currentExerciseIndex];

  // Check if we're done with all exercises
  const allExercisesCompleted = session.blocks.every((block) =>
    block.exercises.every((ex) => ex.completed)
  );

  const handleUpdateExercise = (
    blockId: string,
    exerciseId: string,
    updates: Partial<SessionExercise>
  ) => {
    updateExercise(sessionId, blockId, exerciseId, updates);
  };

  const handleCompleteExercise = (blockId: string, exerciseId: string) => {
    const block = session.blocks.find((b) => b.id === blockId);
    const exercise = block?.exercises.find((e) => e.id === exerciseId);

    if (!exercise) return;

    // For cardio and stretch, RPE is optional
    // For resistance exercises, require actual reps and RPE
    if (exercise.muscleGroup !== 'cardio' && exercise.muscleGroup !== 'stretch') {
      if (exercise.actualReps === undefined || !exercise.rpe) {
        toast({
          variant: "warning",
          title: "Missing Information",
          description: "Please enter actual reps and RPE before completing this exercise.",
        });
        return;
      }
    }

    updateExercise(sessionId, blockId, exerciseId, { completed: true });

    // Move to next exercise/block based on sign-off mode
    if (session.signOffMode === 'per_exercise') {
      moveToNextExercise();
    }
  };

  const handleCompleteBlock = (blockId: string) => {
    const block = session.blocks.find((b) => b.id === blockId);
    if (!block) return;

    const allExercisesCompleted = block.exercises.every((ex) => ex.completed);
    if (!allExercisesCompleted) {
      toast({
        variant: "warning",
        title: "Block Incomplete",
        description: "Please complete all exercises in this block before signing off.",
      });
      return;
    }

    updateBlock(sessionId, blockId, { completed: true });

    // Move to next block
    if (currentBlockIndex < session.blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
      setCurrentExerciseIndex(0);
    } else {
      // All blocks done
      setShowCompletionModal(true);
    }
  };

  const moveToNextExercise = () => {
    if (currentExerciseIndex < currentBlock.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else if (currentBlockIndex < session.blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
      setCurrentExerciseIndex(0);
    } else {
      // All exercises done
      setShowCompletionModal(true);
    }
  };

  const handleCompleteSession = (data: {
    overallRpe: number;
    notes: string;
    trainerDeclaration: boolean;
  }) => {
    completeSession(sessionId, data.overallRpe, data.notes, data.trainerDeclaration);
    router.push('/trainer/sessions');
  };

  const handleTimeUp = () => {
    // Show completion modal when time is up
    setShowCompletionModal(true);
  };

  // Render based on sign-off mode
  const renderFullSessionMode = () => {
    return (
      <div className="space-y-6">
        {session.blocks.map((block, blockIdx) => (
          <Card key={block.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{block.name}</CardTitle>
                {block.completed && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 size={14} />
                    Completed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {block.exercises.map((exercise) => {
                const exerciseData = getExerciseById(exercise.exerciseId);
                if (!exerciseData) return null;

                return (
                  <div
                    key={exercise.id}
                    className={cn(
                      'border rounded-lg p-4',
                      exercise.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    )}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-wondrous-blue-light flex items-center justify-center flex-shrink-0">
                        {exercise.completed ? (
                          <CheckCircle2 className="text-green-600" size={20} />
                        ) : (
                          <span className="text-sm font-semibold text-wondrous-dark-blue">
                            {exercise.position}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{exerciseData.name}</h4>
                          <Badge variant="outline" className="capitalize text-xs">
                            {exercise.muscleGroup}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {exercise.muscleGroup === 'cardio' ? (
                            <>
                              Target: {Math.floor((exercise.cardioDuration || 0) / 60)} min •
                              Intensity {exercise.cardioIntensity}/10
                            </>
                          ) : exercise.muscleGroup === 'stretch' ? (
                            <>Target: {exercise.cardioDuration}s hold</>
                          ) : (
                            <>
                              Target: {exercise.resistanceValue}kg •
                              {exercise.repsMin}-{exercise.repsMax} reps •
                              {exercise.sets} sets
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Input Fields */}
                    {!exercise.completed && exercise.muscleGroup !== 'cardio' && exercise.muscleGroup !== 'stretch' && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <Label className="text-xs">Actual Reps *</Label>
                          <Input
                            type="number"
                            value={exercise.actualReps || ''}
                            onChange={(e) =>
                              handleUpdateExercise(block.id, exercise.id, {
                                actualReps: parseInt(e.target.value) || undefined,
                              })
                            }
                            placeholder={`${exercise.repsMin}-${exercise.repsMax}`}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Actual Weight (kg)</Label>
                          <Input
                            type="number"
                            value={exercise.actualResistance || exercise.resistanceValue}
                            onChange={(e) =>
                              handleUpdateExercise(block.id, exercise.id, {
                                actualResistance: parseInt(e.target.value) || undefined,
                              })
                            }
                            placeholder={String(exercise.resistanceValue)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {!exercise.completed && (
                      <div className="mb-4">
                        <RPEPicker
                          value={exercise.rpe}
                          onChange={(rpe) => handleUpdateExercise(block.id, exercise.id, { rpe })}
                          label="Exercise RPE"
                        />
                      </div>
                    )}

                    {exercise.completed && exercise.actualReps && (
                      <div className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-200">
                        Completed: {exercise.actualReps} reps •{' '}
                        {exercise.actualResistance || exercise.resistanceValue}kg • RPE {exercise.rpe}/10
                      </div>
                    )}

                    {!exercise.completed && (
                      <Button
                        onClick={() => handleCompleteExercise(block.id, exercise.id)}
                        size="sm"
                        className="w-full"
                      >
                        <CheckCircle2 size={16} className="mr-2" />
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={() => setShowCompletionModal(true)}
          disabled={!allExercisesCompleted}
          className="w-full py-6 text-lg"
          size="lg"
        >
          <CheckCircle2 size={24} className="mr-2" />
          Complete Session
        </Button>
      </div>
    );
  };

  const renderPerBlockMode = () => {
    if (!currentBlock) return null;

    return (
      <div className="space-y-6">
        {/* Block Progress */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Block Progress</span>
              <span className="text-sm font-semibold text-gray-900">
                {currentBlockIndex + 1} of {session.blocks.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-wondrous-primary h-full rounded-full transition-all"
                style={{ width: `${((currentBlockIndex + 1) / session.blocks.length) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Current Block */}
        <Card>
          <CardHeader>
            <CardTitle>{currentBlock.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentBlock.exercises.map((exercise) => {
              const exerciseData = getExerciseById(exercise.exerciseId);
              if (!exerciseData) return null;

              return (
                <div
                  key={exercise.id}
                  className={cn(
                    'border rounded-lg p-4',
                    exercise.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  )}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-wondrous-blue-light flex items-center justify-center flex-shrink-0">
                      {exercise.completed ? (
                        <CheckCircle2 className="text-green-600" size={20} />
                      ) : (
                        <span className="text-sm font-semibold text-wondrous-dark-blue">
                          {exercise.position}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{exerciseData.name}</h4>
                        <Badge variant="outline" className="capitalize text-xs">
                          {exercise.muscleGroup}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {exercise.muscleGroup === 'cardio' ? (
                          <>
                            Target: {Math.floor((exercise.cardioDuration || 0) / 60)} min •
                            Intensity {exercise.cardioIntensity}/10
                          </>
                        ) : exercise.muscleGroup === 'stretch' ? (
                          <>Target: {exercise.cardioDuration}s hold</>
                        ) : (
                          <>
                            Target: {exercise.resistanceValue}kg •
                            {exercise.repsMin}-{exercise.repsMax} reps •
                            {exercise.sets} sets
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {!exercise.completed && exercise.muscleGroup !== 'cardio' && exercise.muscleGroup !== 'stretch' && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <Label className="text-xs">Actual Reps *</Label>
                        <Input
                          type="number"
                          value={exercise.actualReps || ''}
                          onChange={(e) =>
                            handleUpdateExercise(currentBlock.id, exercise.id, {
                              actualReps: parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder={`${exercise.repsMin}-${exercise.repsMax}`}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Actual Weight (kg)</Label>
                        <Input
                          type="number"
                          value={exercise.actualResistance || exercise.resistanceValue}
                          onChange={(e) =>
                            handleUpdateExercise(currentBlock.id, exercise.id, {
                              actualResistance: parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder={String(exercise.resistanceValue)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {!exercise.completed && (
                    <div className="mb-4">
                      <RPEPicker
                        value={exercise.rpe}
                        onChange={(rpe) => handleUpdateExercise(currentBlock.id, exercise.id, { rpe })}
                        label="Exercise RPE"
                      />
                    </div>
                  )}

                  {exercise.completed && exercise.actualReps && (
                    <div className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-200">
                      Completed: {exercise.actualReps} reps •{' '}
                      {exercise.actualResistance || exercise.resistanceValue}kg • RPE {exercise.rpe}/10
                    </div>
                  )}

                  {!exercise.completed && (
                    <Button
                      onClick={() => handleCompleteExercise(currentBlock.id, exercise.id)}
                      size="sm"
                      className="w-full"
                    >
                      <CheckCircle2 size={16} className="mr-2" />
                      Mark as Complete
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Button
          onClick={() => handleCompleteBlock(currentBlock.id)}
          disabled={!currentBlock.exercises.every((ex) => ex.completed)}
          className="w-full py-6 text-lg"
          size="lg"
        >
          <CheckCircle2 size={24} className="mr-2" />
          {currentBlockIndex < session.blocks.length - 1 ? 'Complete Block & Continue' : 'Complete Final Block'}
        </Button>
      </div>
    );
  };

  const renderPerExerciseMode = () => {
    if (!currentExercise || !currentBlock) return null;

    const exerciseData = getExerciseById(currentExercise.exerciseId);
    if (!exerciseData) return null;

    const totalExercises = session.blocks.reduce((sum, block) => sum + block.exercises.length, 0);
    const completedExercises = session.blocks.reduce(
      (sum, block) => sum + block.exercises.filter((ex) => ex.completed).length,
      0
    );

    return (
      <div className="space-y-6">
        {/* Exercise Progress */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Exercise Progress</span>
              <span className="text-sm font-semibold text-gray-900">
                {completedExercises + 1} of {totalExercises}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-wondrous-primary h-full rounded-full transition-all"
                style={{ width: `${((completedExercises + 1) / totalExercises) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{currentBlock.name}</p>
          </CardContent>
        </Card>

        {/* Current Exercise */}
        <Card className="border-2 border-wondrous-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-wondrous-primary flex items-center justify-center">
                <span className="text-lg font-bold text-white">{currentExercise.position}</span>
              </div>
              <div>
                <CardTitle className="text-2xl">{exerciseData.name}</CardTitle>
                <Badge variant="outline" className="capitalize mt-1">
                  {currentExercise.muscleGroup}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exercise Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Target</h4>
              <p className="text-gray-700">
                {currentExercise.muscleGroup === 'cardio' ? (
                  <>
                    Duration: {Math.floor((currentExercise.cardioDuration || 0) / 60)} minutes
                    <br />
                    Intensity: {currentExercise.cardioIntensity}/10
                  </>
                ) : currentExercise.muscleGroup === 'stretch' ? (
                  <>Hold: {currentExercise.cardioDuration} seconds</>
                ) : (
                  <>
                    Weight: {currentExercise.resistanceValue}kg
                    <br />
                    Reps: {currentExercise.repsMin}-{currentExercise.repsMax}
                    <br />
                    Sets: {currentExercise.sets}
                  </>
                )}
              </p>
            </div>

            {/* Instructions */}
            {exerciseData.instructions && exerciseData.instructions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  {exerciseData.instructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Input Fields */}
            {currentExercise.muscleGroup !== 'cardio' && currentExercise.muscleGroup !== 'stretch' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Actual Reps *</Label>
                  <Input
                    type="number"
                    value={currentExercise.actualReps || ''}
                    onChange={(e) =>
                      handleUpdateExercise(currentBlock.id, currentExercise.id, {
                        actualReps: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder={`${currentExercise.repsMin}-${currentExercise.repsMax}`}
                    className="mt-1 text-lg h-12"
                  />
                </div>
                <div>
                  <Label>Actual Weight (kg)</Label>
                  <Input
                    type="number"
                    value={currentExercise.actualResistance || currentExercise.resistanceValue}
                    onChange={(e) =>
                      handleUpdateExercise(currentBlock.id, currentExercise.id, {
                        actualResistance: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder={String(currentExercise.resistanceValue)}
                    className="mt-1 text-lg h-12"
                  />
                </div>
              </div>
            )}

            <RPEPicker
              value={currentExercise.rpe}
              onChange={(rpe) => handleUpdateExercise(currentBlock.id, currentExercise.id, { rpe })}
              label="Exercise RPE"
            />

            <Button
              onClick={() => handleCompleteExercise(currentBlock.id, currentExercise.id)}
              className="w-full py-6 text-lg"
              size="lg"
            >
              <CheckCircle2 size={24} className="mr-2" />
              Complete Exercise & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto pb-20">
      {/* Timer - Sticky at top */}
      <SessionTimer onTimeUp={handleTimeUp} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
          <FileText size={16} />
          <span>{session.template.name}</span>
          {session.client && (
            <>
              <span>•</span>
              <User size={16} />
              <span>
                {session.client.firstName} {session.client.lastName}
              </span>
            </>
          )}
        </div>
        <h1 className="text-heading-1 dark:text-gray-100">{session.sessionName}</h1>
        <Badge variant="outline" className="mt-2">
          {session.signOffMode === 'full_session'
            ? 'Full Session Mode'
            : session.signOffMode === 'per_block'
            ? 'Per Block Mode'
            : 'Per Exercise Mode'}
        </Badge>
      </div>

      {/* Content based on sign-off mode */}
      {session.signOffMode === 'full_session' && renderFullSessionMode()}
      {session.signOffMode === 'per_block' && renderPerBlockMode()}
      {session.signOffMode === 'per_exercise' && renderPerExerciseMode()}

      {/* Completion Modal */}
      <SessionCompletionModal
        open={showCompletionModal}
        onComplete={handleCompleteSession}
        sessionName={session.sessionName}
        duration={session.duration || 0}
        clientName={session.client ? `${session.client.firstName} ${session.client.lastName}` : undefined}
      />
    </div>
  );
}
