/**
 * LocalStorage utilities with error handling
 */

export function saveToStorage<T>(key: string, data: T): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (key: ${key}):`, error);
    return false;
  }
}

export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return null;
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Error loading from localStorage (key: ${key}):`, error);
    return null;
  }
}

export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    return false;
  }
}

export function clearStorage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

// Storage keys
export const STORAGE_KEYS = {
  USER_ROLE: 'trainer_aide_user_role',
  TEMPLATES: 'trainer_aide_templates',
  SESSIONS: 'trainer_aide_sessions',
  ACTIVE_SESSION: 'trainer_aide_active_session',
} as const;
