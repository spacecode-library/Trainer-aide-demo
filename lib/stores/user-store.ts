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

      // Logout - clears user data
      logout: () => set({
        currentUser: DEFAULT_USER,
        currentRole: DEFAULT_USER.role,
        isAuthenticated: false,
      }),

      reset: () => set({
        currentUser: DEFAULT_USER,
        currentRole: DEFAULT_USER.role,
        isAuthenticated: true,
      }),
    }),
    {
      name: 'trainer-aide-user',
    }
  )
);
