import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalendarSession } from '@/lib/types/calendar';
import { CALENDAR_SESSIONS } from '@/lib/data/calendar-data';

interface CalendarState {
  sessions: CalendarSession[];

  // Initialize with mock data
  initializeSessions: () => void;

  // Session management
  addSession: (session: CalendarSession) => void;
  updateSession: (sessionId: string, updates: Partial<CalendarSession>) => void;
  removeSession: (sessionId: string) => void;

  // Getters
  getSessionById: (sessionId: string) => CalendarSession | undefined;
  getSessionsByDate: (date: Date) => CalendarSession[];
}

// Custom serialization to handle Date objects
const dateReviver = (key: string, value: any) => {
  if (key === 'datetime' || key === 'holdExpiry' || key === 'createdAt') {
    return value ? new Date(value) : value;
  }
  return value;
};

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      sessions: [],

      initializeSessions: () => {
        const existingSessions = get().sessions;
        if (existingSessions.length === 0) {
          set({ sessions: CALENDAR_SESSIONS });
        }
      },

      addSession: (session) => {
        set((state) => ({
          sessions: [...state.sessions, session],
        }));
      },

      updateSession: (sessionId, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, ...updates } : s
          ),
        }));
      },

      removeSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
        }));
      },

      getSessionById: (sessionId) => {
        return get().sessions.find((s) => s.id === sessionId);
      },

      getSessionsByDate: (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return get().sessions.filter((s) => {
          const sessionDate = s.datetime instanceof Date ? s.datetime : new Date(s.datetime);
          return sessionDate >= startOfDay && sessionDate <= endOfDay;
        });
      },
    }),
    {
      name: 'trainer-aide-calendar',
      // Custom storage to properly handle Date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          // Convert date strings back to Date objects
          if (state.sessions) {
            state.sessions = state.sessions.map((session: any) => ({
              ...session,
              datetime: session.datetime ? new Date(session.datetime) : session.datetime,
              holdExpiry: session.holdExpiry ? new Date(session.holdExpiry) : session.holdExpiry,
            }));
          }
          return { state };
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
