import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, SessionBlock, SessionExercise } from '@/lib/types';
import { MOCK_SESSIONS } from '@/lib/mock-data';

interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;

  // Initialize with mock sessions
  initializeSessions: () => void;

  // Session management
  startSession: (session: Omit<Session, 'id' | 'startedAt' | 'completed' | 'trainerDeclaration'>) => string;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  completeSession: (sessionId: string, overallRpe: number, notes: string, trainerDeclaration: boolean) => void;
  deleteSession: (sessionId: string) => void;

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

      completeSession: (sessionId, overallRpe, notes, trainerDeclaration) => {
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
                  notes,
                  trainerDeclaration,
                }
              : s
          ),
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        }));
      },

      deleteSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
      })),

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
        return get().sessions.find(s => s.id === sessionId);
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find(s => s.id === activeSessionId);
      },

      getCompletedSessions: () => {
        return get().sessions.filter(s => s.completed);
      },

      getInProgressSessions: () => {
        return get().sessions.filter(s => !s.completed);
      },
    }),
    {
      name: 'trainer-aide-sessions',
    }
  )
);
