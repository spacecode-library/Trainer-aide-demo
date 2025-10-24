import { User } from '@/lib/types';

export const MOCK_USERS: User[] = [
  {
    id: 'user_owner_1',
    firstName: 'John',
    lastName: 'Doe',
    role: 'studio_owner',
    email: 'john.doe@wondrous.com',
  },
  {
    id: 'user_trainer_1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'trainer',
    email: 'sarah.johnson@wondrous.com',
  },
  {
    id: 'user_trainer_2',
    firstName: 'Michael',
    lastName: 'Browne',
    role: 'trainer',
    email: 'michael.browne@wondrous.com',
  },
  {
    id: 'client_1',
    firstName: 'Tom',
    lastName: 'Phillips',
    role: 'client',
    email: 'tom.phillips@example.com',
  },
];

// Default user for demo (can be changed by role selector)
export const DEFAULT_USER = MOCK_USERS[1]; // Trainer (Sarah Johnson)

// Helper function to get user by ID
export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find(user => user.id === id);
}

// Helper function to get user by role
export function getUserByRole(role: 'studio_owner' | 'trainer' | 'client'): User | undefined {
  return MOCK_USERS.find(user => user.role === role);
}
