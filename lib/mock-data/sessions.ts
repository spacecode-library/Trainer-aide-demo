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
    privateNotes: undefined,
    publicNotes: undefined,
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
  privateNotes: string,
  publicNotes: string
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
  session.privateNotes = privateNotes;
  session.publicNotes = publicNotes;
  session.trainerDeclaration = true;
  session.completed = true;

  return session;
}

// ========================================
// MOCK SESSIONS
// ========================================
// IMPORTANT: All mock sessions are completed sessions.
// The app enforces that trainers can only have ONE active session at a time.
// When a session is started (via startSession), it becomes the active session
// and prevents starting new sessions until it's completed.
// This constraint ensures:
// 1. Trainers focus on one client at a time
// 2. Timer state is unambiguous (only one timer can be active)
// 3. Session data integrity (no overlapping sessions)
// This mock data structure will inform the real API design where:
// - POST /api/sessions will check for existing active sessions
// - GET /api/sessions/active will return the single active session
// - PATCH /api/sessions/:id/complete will clear the active session

export const MOCK_SESSIONS: Session[] = [
  // Completed session 1
  createCompletedSession(
    'session_completed_1',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'template_results_first',
    'per_block',
    '2025-10-20T10:00:00Z',
    1920, // 32 minutes
    7,
    'Tom showed improvement in form on chest press. Ready to increase weight next time. Watch left knee.', // Private notes
    'Great session! Keep up the excellent work!' // Public notes
  ),

  // Completed session 2
  createCompletedSession(
    'session_completed_2',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    'template_advanced_hiit',
    'per_exercise',
    '2025-10-19T14:00:00Z',
    1800, // 30 minutes
    8,
    'Jane has minor shoulder discomfort. Monitor for next session. Maintain current weights.', // Private notes
    'Jane crushed it today! High energy throughout. Amazing work!' // Public notes
  ),

  // Completed session 3
  createCompletedSession(
    'session_completed_3',
    '22222222-2222-2222-2222-222222222222',
    '77777777-7777-7777-7777-777777777777',
    'template_results_first',
    'full_session',
    '2025-10-18T09:00:00Z',
    1860, // 31 minutes
    6,
    'Mike needs to focus on squat depth. Consider mobility work before next session.', // Private notes
    'Good consistent effort today. Well done!' // Public notes
  ),

  // In-progress sessions - one for each sign-off mode for testing

  // Per Block Mode (default active session)
  createSessionFromTemplate(
    'session_in_progress_per_block',
    '22222222-2222-2222-2222-222222222222',
    '88888888-8888-8888-8888-888888888888',
    'template_resistance_only',
    'per_block',
    '2025-11-06T12:00:00Z', // Fixed timestamp for testing
    false
  ),

  // Per Exercise Mode
  createSessionFromTemplate(
    'session_in_progress_per_exercise',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'template_results_first',
    'per_exercise',
    '2025-11-06T12:30:00Z', // Fixed timestamp for testing
    false
  ),

  // Full Session Mode
  createSessionFromTemplate(
    'session_in_progress_full_session',
    '22222222-2222-2222-2222-222222222222',
    '66666666-6666-6666-6666-666666666666',
    'template_advanced_hiit',
    'full_session',
    '2025-11-06T11:45:00Z', // Fixed timestamp for testing
    false
  ),
];

// Helper function to get session by ID
export function getSessionById(id: string): Session | undefined {
  return MOCK_SESSIONS.find(session => session.id === id);
}
