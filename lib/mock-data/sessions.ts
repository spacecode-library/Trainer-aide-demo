import { Session, SessionBlock, SessionExercise } from '@/lib/types';
import { MOCK_TEMPLATES } from './templates';
import { MOCK_EXERCISES, getExerciseById } from './exercises';
import { MOCK_CLIENTS } from './clients';

// Helper function to convert template to session
function createSessionFromTemplate(
  sessionId: string,
  trainerId: string,
  clientId: string,
  templateId: string,
  signOffMode: 'full_session' | 'per_block' | 'per_exercise',
  startedAt: string,
  completed: boolean = false,
  completedAt?: string
): Session {
  const template = MOCK_TEMPLATES.find(t => t.id === templateId);
  const client = MOCK_CLIENTS.find(c => c.id === clientId);

  if (!template || !client) {
    throw new Error('Template or client not found');
  }

  // Convert template blocks to session blocks
  const sessionBlocks: SessionBlock[] = template.blocks.map(block => {
    const sessionExercises: SessionExercise[] = block.exercises.map(ex => {
      return {
        id: `se_${ex.id}`,
        exerciseId: ex.exerciseId,
        position: ex.position,
        muscleGroup: ex.muscleGroup,
        resistanceType: ex.resistanceType,
        resistanceValue: ex.resistanceValue,
        repsMin: ex.repsMin,
        repsMax: ex.repsMax,
        sets: ex.sets,
        cardioDuration: ex.cardioDuration,
        cardioIntensity: ex.cardioIntensity,
        completed: false,
        actualResistance: undefined,
        actualReps: undefined,
        actualDuration: undefined,
        rpe: undefined,
      };
    });

    return {
      id: `sb_${block.id}`,
      blockNumber: block.blockNumber,
      name: block.name,
      exercises: sessionExercises,
      rpe: undefined,
      completed: false,
    };
  });

  return {
    id: sessionId,
    trainerId,
    clientId,
    client,
    templateId,
    template,
    sessionName: `${template.name} with ${client.firstName}`,
    signOffMode,
    blocks: sessionBlocks,
    startedAt,
    completedAt,
    duration: completedAt ? Math.floor((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000) : undefined,
    overallRpe: undefined,
    notes: undefined,
    recommendations: undefined,
    trainerDeclaration: false,
    completed,
  };
}

// Create a completed session with all data filled in
function createCompletedSession(
  sessionId: string,
  trainerId: string,
  clientId: string,
  templateId: string,
  signOffMode: 'full_session' | 'per_block' | 'per_exercise',
  startedAt: string,
  duration: number,
  overallRpe: number,
  notes: string
): Session {
  const session = createSessionFromTemplate(
    sessionId,
    trainerId,
    clientId,
    templateId,
    signOffMode,
    startedAt,
    true,
    new Date(new Date(startedAt).getTime() + duration * 1000).toISOString()
  );

  // Mark all blocks and exercises as completed with realistic data
  session.blocks = session.blocks.map((block, blockIndex) => ({
    ...block,
    completed: true,
    rpe: [7, 8, 6][blockIndex] || 7, // Different RPE for each block
    exercises: block.exercises.map((ex, exIndex) => ({
      ...ex,
      completed: true,
      actualResistance: ex.resistanceType === 'weight' ? ex.resistanceValue : undefined,
      actualReps: ex.repsMin > 0 ? Math.floor((ex.repsMin + ex.repsMax) / 2) : undefined,
      actualDuration: ex.cardioDuration,
      rpe: [6, 7, 8, 7, 6][exIndex] || 7, // Varied RPE for each exercise
    })),
  }));

  session.overallRpe = overallRpe;
  session.notes = notes;
  session.trainerDeclaration = true;
  session.completed = true;

  return session;
}

// ========================================
// MOCK SESSIONS
// ========================================

export const MOCK_SESSIONS: Session[] = [
  // Completed session 1
  createCompletedSession(
    'session_completed_1',
    'user_trainer_1',
    'client_1',
    'template_results_first',
    'per_block',
    '2025-10-20T10:00:00Z',
    1920, // 32 minutes
    7,
    'Great session! Tom showed improvement in form on chest press. Ready to increase weight next time.'
  ),

  // Completed session 2
  createCompletedSession(
    'session_completed_2',
    'user_trainer_2',
    'client_2',
    'template_advanced_hiit',
    'per_exercise',
    '2025-10-19T14:00:00Z',
    1800, // 30 minutes
    8,
    'Jane crushed it today! High energy throughout. Maintain current weights.'
  ),

  // Completed session 3
  createCompletedSession(
    'session_completed_3',
    'user_trainer_1',
    'client_3',
    'template_results_first',
    'full_session',
    '2025-10-18T09:00:00Z',
    1860, // 31 minutes
    6,
    'Good consistent effort. Mike needs to focus on squat depth.'
  ),

  // In-progress session
  createSessionFromTemplate(
    'session_in_progress_1',
    'user_trainer_1',
    'client_4',
    'template_resistance_only',
    'per_block',
    new Date(Date.now() - 600000).toISOString(), // Started 10 minutes ago
    false
  ),
];

// Helper function to get session by ID
export function getSessionById(id: string): Session | undefined {
  return MOCK_SESSIONS.find(session => session.id === id);
}

// Helper function to get sessions by trainer
export function getSessionsByTrainer(trainerId: string): Session[] {
  return MOCK_SESSIONS.filter(session => session.trainerId === trainerId);
}

// Helper function to get sessions by client
export function getSessionsByClient(clientId: string): Session[] {
  return MOCK_SESSIONS.filter(session => session.clientId === clientId);
}

// Helper function to get completed sessions
export function getCompletedSessions(): Session[] {
  return MOCK_SESSIONS.filter(session => session.completed);
}

// Helper function to get in-progress sessions
export function getInProgressSessions(): Session[] {
  return MOCK_SESSIONS.filter(session => !session.completed);
}
