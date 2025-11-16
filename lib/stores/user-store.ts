import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/lib/types';
import { DEFAULT_USER, MOCK_USERS } from '@/lib/mock-data/users';

interface UserState {
  currentUser: User;
  currentRole: UserRole;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  login: (email: string) => boolean;
  logout: () => void;
  reset: () => void;
  // Permission methods
  canBuildTemplates: () => boolean;
  canPushToClients: () => boolean;
  canViewStudioOwnerFeatures: () => boolean;
  canViewTrainerFeatures: () => boolean;
  canCreateAIPrograms: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: DEFAULT_USER,
      currentRole: DEFAULT_USER.role,
      isAuthenticated: true, // Demo mode - auto authenticated

      setUser: (user) => set({ currentUser: user, currentRole: user.role, isAuthenticated: true }),

      setRole: (role) => set((state) => ({
        currentRole: role,
        currentUser: { ...state.currentUser, role },
      })),

      // Demo login - finds user by email and logs them in
      login: (email: string) => {
        const user = MOCK_USERS.find(u => u.email === email);
        if (user) {
          set({ currentUser: user, currentRole: user.role, isAuthenticated: true });
          return true;
        }
        return false;
      },

      // Logout - clears user data, sessions, and timer
      logout: () => {
        // Import stores here to avoid circular dependencies
        const { useSessionStore } = require('./session-store');
        const { useTimerStore } = require('./timer-store');

        // Clear sessions and timer
        useSessionStore.getState().clearAllSessions();
        useTimerStore.getState().clearTimer();

        // Clear user data
        set({
          currentUser: DEFAULT_USER,
          currentRole: DEFAULT_USER.role,
          isAuthenticated: false,
        });
      },

      reset: () => set({
        currentUser: DEFAULT_USER,
        currentRole: DEFAULT_USER.role,
        isAuthenticated: true,
      }),

      // Permission methods
      canBuildTemplates: (): boolean => {
        const state = useUserStore.getState();
        return state.currentRole === 'studio_owner' || state.currentRole === 'solo_practitioner';
      },

      canPushToClients: (): boolean => {
        const state = useUserStore.getState();
        return state.currentRole === 'solo_practitioner';
      },

      canViewStudioOwnerFeatures: (): boolean => {
        const state = useUserStore.getState();
        return state.currentRole === 'studio_owner' || state.currentRole === 'solo_practitioner';
      },

      canViewTrainerFeatures: (): boolean => {
        const state = useUserStore.getState();
        return state.currentRole === 'trainer' || state.currentRole === 'solo_practitioner';
      },

      canCreateAIPrograms: (): boolean => {
        const state = useUserStore.getState();
        return state.currentRole === 'solo_practitioner';
      },
    }),
    {
      name: 'trainer-aide-user',
    }
  )
);
