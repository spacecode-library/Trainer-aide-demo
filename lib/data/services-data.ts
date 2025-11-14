import { Service } from '../types/service';

// Mock Services - What Equal Results offers
// These are session types that can be booked, NOT workout programs
export const MOCK_SERVICES: Service[] = [
  {
    id: 'service_30min_pt',
    name: '30min PT Session',
    description: 'Standard 30-minute personal training session',
    duration: 30,
    type: '1-2-1',
    maxCapacity: 1,
    creditsRequired: 1,
    color: '#12229D',
    isActive: true,
    createdBy: 'user_owner_1',
    assignedStudios: ['studio_1'], // Available at all Equal Results studios
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'service_45min_pt',
    name: '45min PT Session',
    description: 'Extended 45-minute personal training session',
    duration: 45,
    type: '1-2-1',
    maxCapacity: 1,
    creditsRequired: 1.5,
    color: '#A71075',
    isActive: true,
    createdBy: 'user_owner_1',
    assignedStudios: ['studio_1'],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'service_60min_pt',
    name: '60min PT Session',
    description: 'Full hour personal training session',
    duration: 60,
    type: '1-2-1',
    maxCapacity: 1,
    creditsRequired: 2,
    color: '#F4B324',
    isActive: true,
    createdBy: 'user_owner_1',
    assignedStudios: ['studio_1'],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'service_duet_30min',
    name: '30min Duet Session',
    description: 'Train with a partner - 30 minutes',
    duration: 30,
    type: 'duet',
    maxCapacity: 2,
    creditsRequired: 0.75,
    color: '#AB1D79',
    isActive: false, // Equal Results doesn't currently offer this
    createdBy: 'user_owner_1',
    assignedStudios: ['studio_1'],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'service_group_45min',
    name: '45min Group Session',
    description: 'Small group training (max 5 people)',
    duration: 45,
    type: 'group',
    maxCapacity: 5,
    creditsRequired: 0.5,
    color: '#12229D',
    isActive: false, // Equal Results doesn't currently offer this
    createdBy: 'user_owner_1',
    assignedStudios: ['studio_1'],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

// Helper functions
export function getService(serviceId: string): Service | undefined {
  return MOCK_SERVICES.find((s) => s.id === serviceId);
}

export function getActiveServices(): Service[] {
  return MOCK_SERVICES.filter((s) => s.isActive);
}
