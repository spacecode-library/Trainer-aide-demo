import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, SessionBlock, SessionExercise } from '@/lib/types';
import { MOCK_SESSIONS } from '@/lib/mock-data';
import { useTimerStore } from './timer-store';
import { useUserStore } from './user-store';

interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;

  // Initialize with mock sessions
  initializeSessions: () => void;

  // Session management
  startSession: (session: Omit<Session, 'id' | 'startedAt' | 'completed' | 'trainerDeclaration'>) => string;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  completeSession: (sessionId: string, overallRpe: number, privateNotes: string, publicNotes: string, trainerDeclaration: boolean) => void;
  deleteSession: (sessionId: string) => void;
  clearAllSessions: () => void;

  // Block management
  updateBlock: (sessionId: string, blockId: string, updates: Partial<SessionBlock>) => void;
  completeBlock: (sessionId: string, blockId: string, rpe: number) => void;

  // Exercise management
  updateExercise: (sessionId: string, blockId: string, exerciseId: string, updates: Partial<SessionExercise>) => void;
  toggleExerciseComplete: (sessionId: string, blockId: string, exerciseId: string) => void;

  // Getters
  getSessionById: (sessionId: string) => Session | undefined;
  getActiveSession: () => Session | undefined;
  getCompletedSessions: () => Session[];
  getInProgressSessions: () => Session[];
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      initializeSessions: () => {
        const existingSessions = get().sessions;
        if (existingSessions.length === 0) {
          set({ sessions: MOCK_SESSIONS });
        }
      },

      startSession: (sessionData) => {
        const state = get();

        // Check if there's already an active session
        const activeSession = state.sessions.find(s => s.id === state.activeSessionId && !s.completed);
        if (activeSession) {
          throw new Error('Cannot start a new session. Please complete or cancel the current active session first.');
        }

        const newSession: Session = {
          ...sessionData,
          id: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          startedAt: new Date().toISOString(),
          completed: false,
          trainerDeclaration: false,
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: newSession.id,
        }));

        return newSession.id;
      },

      updateSession: (sessionId, updates) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId ? { ...s, ...updates } : s
        ),
      })),

      completeSession: (sessionId, overallRpe, privateNotes, publicNotes, trainerDeclaration) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) return;

        const duration = Math.floor((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000);

        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  completed: true,
                  completedAt: new Date().toISOString(),
                  duration,
                  overallRpe,
                  privateNotes,
                  publicNotes,
                  trainerDeclaration,
                }
              : s
          ),
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        }));

        // Clear the timer when session is completed
        useTimerStore.getState().clearTimer();
      },

      deleteSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
      })),

      clearAllSessions: () => set({
        sessions: [],
        activeSessionId: null,
      }),

      updateBlock: (sessionId, blockId, updates) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? {
                ...s,
                blocks: s.blocks.map(b =>
                  b.id === blockId ? { ...b, ...updates } : b
                ),
              }
            : s
        ),
      })),

      completeBlock: (sessionId, blockId, rpe) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? {
                ...s,
                blocks: s.blocks.map(b =>
                  b.id === blockId
                    ? { ...b, completed: true, rpe }
                    : b
                ),
              }
            : s
        ),
      })),

      updateExercise: (sessionId, blockId, exerciseId, updates) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? {
                ...s,
                blocks: s.blocks.map(b =>
                  b.id === blockId
                    ? {
                        ...b,
                        exercises: b.exercises.map(ex =>
                          ex.id === exerciseId ? { ...ex, ...updates } : ex
                        ),
                      }
                    : b
                ),
              }
            : s
        ),
      })),

      toggleExerciseComplete: (sessionId, blockId, exerciseId) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? {
                ...s,
                blocks: s.blocks.map(b =>
                  b.id === blockId
                    ? {
                        ...b,
                        exercises: b.exercises.map(ex =>
                          ex.id === exerciseId
                            ? { ...ex, completed: !ex.completed }
                            : ex
                        ),
                      }
                    : b
                ),
              }
            : s
        ),
      })),

      getSessionById: (sessionId) => {
        const currentUserId = useUserStore.getState().currentUser.id;
        return get().sessions.find(s => s.id === sessionId && s.trainerId === currentUserId);
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        const currentUserId = useUserStore.getState().currentUser.id;
        return sessions.find(s => s.id === activeSessionId && s.trainerId === currentUserId);
      },

      getCompletedSessions: () => {
        const currentUserId = useUserStore.getState().currentUser.id;
        return get().sessions.filter(s => s.completed && s.trainerId === currentUserId);
      },

      getInProgressSessions: () => {
        const currentUserId = useUserStore.getState().currentUser.id;
        return get().sessions.filter(s => !s.completed && s.trainerId === currentUserId);
      },
    }),
    {
      name: 'trainer-aide-sessions',
    }
  )
);
