import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  sessionId: string | null;
  startTime: number | null; // Unix timestamp when timer started
  totalSeconds: number; // Total duration in seconds
  isPaused: boolean;
  pausedAt: number | null; // Unix timestamp when paused
  accumulatedPausedTime: number; // Total time spent paused in seconds

  // Actions
  startTimer: (sessionId: string, totalSeconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  clearTimer: () => void;

  // Getters
  getSecondsLeft: () => number;
  isTimerActive: () => boolean;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      startTime: null,
      totalSeconds: 30 * 60, // Default 30 minutes
      isPaused: false,
      pausedAt: null,
      accumulatedPausedTime: 0,

      startTimer: (sessionId, totalSeconds) => {
        set({
          sessionId,
          startTime: Date.now(),
          totalSeconds,
          isPaused: false,
          pausedAt: null,
          accumulatedPausedTime: 0,
        });
      },

      pauseTimer: () => {
        const state = get();
        if (state.isPaused || !state.startTime) return;

        set({
          isPaused: true,
          pausedAt: Date.now(),
        });
      },

      resumeTimer: () => {
        const state = get();
        if (!state.isPaused || !state.pausedAt) return;

        const pausedDuration = (Date.now() - state.pausedAt) / 1000;

        set({
          isPaused: false,
          pausedAt: null,
          accumulatedPausedTime: state.accumulatedPausedTime + pausedDuration,
        });
      },

      resetTimer: () => {
        const state = get();
        set({
          startTime: Date.now(),
          isPaused: false,
          pausedAt: null,
          accumulatedPausedTime: 0,
        });
      },

      clearTimer: () => {
        set({
          sessionId: null,
          startTime: null,
          totalSeconds: 30 * 60,
          isPaused: false,
          pausedAt: null,
          accumulatedPausedTime: 0,
        });
      },

      getSecondsLeft: () => {
        const state = get();
        if (!state.startTime) return state.totalSeconds;

        const now = Date.now();
        const elapsedTime = (now - state.startTime) / 1000;

        // If paused, calculate elapsed time up to pause point
        const effectiveElapsedTime = state.isPaused && state.pausedAt
          ? (state.pausedAt - state.startTime) / 1000
          : elapsedTime;

        const adjustedElapsed = effectiveElapsedTime - state.accumulatedPausedTime;
        const secondsLeft = Math.max(0, state.totalSeconds - adjustedElapsed);

        return Math.floor(secondsLeft);
      },

      isTimerActive: () => {
        const state = get();
        return state.sessionId !== null && state.startTime !== null;
      },
    }),
    {
      name: 'trainer-aide-timer',
    }
  )
);
