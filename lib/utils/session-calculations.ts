import { Session } from '@/lib/types';

/**
 * Utility functions for common session calculations
 * Eliminates duplicate calculation logic across components
 */

/**
 * Calculate exercise progress for a session
 * @param session - The session to calculate progress for
 * @returns Object with completed count, total count, and percentage
 */
export function calculateExerciseProgress(session: Session): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = session.blocks.reduce(
    (sum, block) => sum + block.exercises.filter((ex) => ex.completed).length,
    0
  );

  const total = session.blocks.reduce(
    (sum, block) => sum + block.exercises.length,
    0
  );

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Calculate average RPE from multiple sessions
 * Filters out sessions without RPE and avoids triple-filtering anti-pattern
 * @param sessions - Array of sessions
 * @returns Average RPE (rounded) or 0 if no sessions have RPE
 */
export function calculateAverageRPE(sessions: Session[]): number {
  const sessionsWithRpe = sessions.filter((s) => s.overallRpe);

  if (sessionsWithRpe.length === 0) return 0;

  const totalRpe = sessionsWithRpe.reduce((acc, s) => acc + (s.overallRpe || 0), 0);
  return Math.round(totalRpe / sessionsWithRpe.length);
}

/**
 * Calculate earnings for completed sessions
 * @param completedCount - Number of completed sessions
 * @param ratePerSession - Rate per session (default: £30)
 * @returns Total earnings
 */
export function calculateEarnings(
  completedCount: number,
  ratePerSession: number = 30
): number {
  return completedCount * ratePerSession;
}

/**
 * Get sessions from the past N days
 * @param sessions - Array of sessions
 * @param days - Number of days to look back (default: 7)
 * @returns Filtered sessions
 */
export function getSessionsFromLastNDays(
  sessions: Session[],
  days: number = 7
): Session[] {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return sessions.filter(
    (s) => s.completed && new Date(s.startedAt) >= startDate
  );
}

/**
 * Format a date consistently across the app
 * Normalizes Date object vs date string handling
 * @param date - Date object or date string
 * @returns Date object
 */
export function normalizeDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}

/**
 * Check if a session date is in the future
 * @param sessionDate - Date object or date string
 * @returns True if session is upcoming
 */
export function isUpcoming(sessionDate: Date | string): boolean {
  const normalized = normalizeDate(sessionDate);
  return normalized > new Date();
}

/**
 * Calculate block completion percentage
 * @param block - Session block
 * @returns Completion percentage (0-100)
 */
export function calculateBlockProgress(block: {
  exercises: Array<{ completed: boolean }>;
}): number {
  const completed = block.exercises.filter((ex) => ex.completed).length;
  const total = block.exercises.length;

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
