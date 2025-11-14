import { User } from '@/lib/types';

export const MOCK_USERS: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    firstName: 'John',
    lastName: 'Doe',
    role: 'studio_owner',
    email: 'john.doe@wondrous.com',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'trainer',
    email: 'sarah.johnson@wondrous.com',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    firstName: 'Michael',
    lastName: 'Browne',
    role: 'trainer',
    email: 'michael.browne@wondrous.com',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    firstName: 'Tom',
    lastName: 'Phillips',
    role: 'client',
    email: 'tom.phillips@example.com',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    firstName: 'Alex',
    lastName: 'Rivera',
    role: 'solo_practitioner',
    email: 'alex.rivera@wondrous.com',
  },
];

// Default user for demo (can be changed by role selector)
export const DEFAULT_USER = MOCK_USERS[1]; // Trainer (Sarah Johnson)

// Helper function to get user by ID
export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find(user => user.id === id);
}

// Helper function to get user by role
export function getUserByRole(role: 'studio_owner' | 'trainer' | 'client' | 'solo_practitioner'): User | undefined {
  return MOCK_USERS.find(user => user.role === role);
}
