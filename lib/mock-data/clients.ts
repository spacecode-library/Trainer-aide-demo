import { Client } from '@/lib/types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client_1',
    firstName: 'Tom',
    lastName: 'Phillips',
    email: 'tom.phillips@example.com',
    joinedAt: '2025-08-15T10:00:00Z',
  },
  {
    id: 'client_2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    joinedAt: '2025-07-20T14:30:00Z',
  },
  {
    id: 'client_3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.j@example.com',
    joinedAt: '2025-09-01T09:00:00Z',
  },
  {
    id: 'client_4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@example.com',
    joinedAt: '2025-08-10T16:45:00Z',
  },
  {
    id: 'client_5',
    firstName: 'Alex',
    lastName: 'Brown',
    email: 'alex.brown@example.com',
    joinedAt: '2025-09-15T11:20:00Z',
  },
];

// Helper function to get client by ID
export function getClientById(id: string): Client | undefined {
  return MOCK_CLIENTS.find(client => client.id === id);
}
