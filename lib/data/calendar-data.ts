// Calendar data: Service types, clients, workout templates

import { ServiceType, CalendarSession, WorkoutTemplate } from '../types/calendar';

/**
 * Service Types - What the studio offers (session types)
 * Based on Equal Results: Primary focus is 30min PT sessions (1-2-1)
 * Other studios may offer different durations and types
 * Using brand colors: #A71075, #AB1D79, #12229D, #F4B324
 */
export const SERVICE_TYPES: ServiceType[] = [
  {
    id: 'service_1',
    name: '30min PT Session',
    duration: 30,
    color: '#12229D', // Blue
    creditsRequired: 1,
  },
  {
    id: 'service_2',
    name: '45min PT Session',
    duration: 45,
    color: '#A71075', // Vivid Magenta
    creditsRequired: 1.5,
  },
  {
    id: 'service_3',
    name: '60min PT Session',
    duration: 60,
    color: '#AB1D79', // Magenta alt
    creditsRequired: 2,
  },
  {
    id: 'service_4',
    name: '75min PT Session',
    duration: 75,
    color: '#F4B324', // Orange
    creditsRequired: 2.5,
  },
  {
    id: 'service_5',
    name: '90min PT Session',
    duration: 90,
    color: '#12229D', // Blue
    creditsRequired: 3,
  },
];

/**
 * Workout Templates
 */
export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'workout_1',
    name: 'Full Body Strength',
    exercises: ['Squats', 'Push-ups', 'Rows', 'Lunges'],
  },
  {
    id: 'workout_2',
    name: 'Upper Body Focus',
    exercises: ['Bench Press', 'Pull-ups', 'Shoulder Press'],
  },
  {
    id: 'workout_3',
    name: 'Lower Body Power',
    exercises: ['Deadlifts', 'Leg Press', 'Calf Raises'],
  },
  {
    id: 'workout_4',
    name: 'Core & Cardio',
    exercises: ['Planks', 'Mountain Climbers', 'Burpees'],
  },
  {
    id: 'workout_5',
    name: 'HIIT Circuit',
    exercises: ['Jump Squats', 'Push-ups', 'High Knees'],
  },
];

/**
 * Calendar Clients (Enhanced with initials and credits)
 */
export interface CalendarClient {
  id: string;
  name: string;
  avatar: string; // User initials (e.g., "SM" for Sarah Mitchell)
  color: string;
  credits: number;
  phone: string;
}

export const CALENDAR_CLIENTS: CalendarClient[] = [
  {
    id: 'client_1',
    name: 'Sarah Mitchell',
    avatar: 'SM',
    color: '#A71075',
    credits: 8,
    phone: '07700900123',
  },
  {
    id: 'client_2',
    name: 'James Wilson',
    avatar: 'JW',
    color: '#12229D',
    credits: 5,
    phone: '07700900456',
  },
  {
    id: 'client_3',
    name: 'Emma Thompson',
    avatar: 'ET',
    color: '#AB1D79',
    credits: 12,
    phone: '07700900789',
  },
  {
    id: 'client_4',
    name: 'Michael Chen',
    avatar: 'MC',
    color: '#12229D',
    credits: 4,
    phone: '07700900321',
  },
  {
    id: 'client_5',
    name: 'Lisa Anderson',
    avatar: 'LA',
    color: '#F4B324',
    credits: 3,
    phone: '07700900654',
  },
  {
    id: 'client_6',
    name: 'David Brown',
    avatar: 'DB',
    color: '#A71075',
    credits: 0,
    phone: '07700900987',
  },
];

/**
 * Helper: Get date offset (for mock data)
 */
const getDateOffset = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Mock Calendar Sessions
 * Spanning current week with various statuses
 */
export const CALENDAR_SESSIONS: CalendarSession[] = [
  // Today
  {
    id: 'session_1',
    datetime: new Date(getDateOffset(0).setHours(7, 0, 0, 0)),
    clientId: 'client_1',
    clientName: 'Sarah Mitchell',
    clientAvatar: 'SM',
    clientColor: '#A71075',
    clientCredits: 8,
    status: 'confirmed',
    serviceTypeId: 'service_1',
    workoutId: null,
  },
  {
    id: 'session_2',
    datetime: new Date(getDateOffset(0).setHours(8, 15, 0, 0)),
    clientId: 'client_3',
    clientName: 'Emma Thompson',
    clientAvatar: 'ET',
    clientColor: '#AB1D79',
    clientCredits: 12,
    status: 'confirmed',
    serviceTypeId: 'service_1',
    workoutId: 'workout_1',
    templateId: 'template_results_first',
    signOffMode: 'per_block',
  },
  {
    id: 'session_3',
    datetime: new Date(getDateOffset(0).setHours(10, 0, 0, 0)),
    clientId: 'client_2',
    clientName: 'James Wilson',
    clientAvatar: 'JW',
    clientColor: '#12229D',
    clientCredits: 5,
    status: 'soft-hold',
    serviceTypeId: 'service_2',
    holdExpiry: new Date(Date.now() + 23 * 60 * 60 * 1000),
  },
  // Tomorrow
  {
    id: 'session_4',
    datetime: new Date(getDateOffset(1).setHours(7, 0, 0, 0)),
    clientId: 'client_4',
    clientName: 'Michael Chen',
    clientAvatar: 'MC',
    clientColor: '#12229D',
    clientCredits: 4,
    status: 'checked-in',
    serviceTypeId: 'service_3',
    workoutId: 'workout_2',
    templateId: 'template_advanced_hiit',
    signOffMode: 'per_exercise',
  },
  {
    id: 'session_5',
    datetime: new Date(getDateOffset(1).setHours(9, 30, 0, 0)),
    clientId: 'client_5',
    clientName: 'Lisa Anderson',
    clientAvatar: 'LA',
    clientColor: '#F4B324',
    clientCredits: 3,
    status: 'soft-hold',
    serviceTypeId: 'service_1',
    holdExpiry: new Date(Date.now() + 4 * 60 * 60 * 1000),
  },
  {
    id: 'session_6',
    datetime: new Date(getDateOffset(1).setHours(16, 0, 0, 0)),
    clientId: 'client_1',
    clientName: 'Sarah Mitchell',
    clientAvatar: 'SM',
    clientColor: '#A71075',
    clientCredits: 8,
    status: 'confirmed',
    serviceTypeId: 'service_4',
  },
  // Day after tomorrow
  {
    id: 'session_7',
    datetime: new Date(getDateOffset(2).setHours(7, 30, 0, 0)),
    clientId: 'client_6',
    clientName: 'David Brown',
    clientAvatar: 'DB',
    clientColor: '#A71075',
    clientCredits: 0,
    status: 'confirmed',
    serviceTypeId: 'service_1',
    workoutId: 'workout_5',
  },
  {
    id: 'session_8',
    datetime: new Date(getDateOffset(2).setHours(15, 0, 0, 0)),
    clientId: 'client_3',
    clientName: 'Emma Thompson',
    clientAvatar: 'ET',
    clientColor: '#AB1D79',
    clientCredits: 12,
    status: 'confirmed',
    serviceTypeId: 'service_5',
  },
  // +3 days
  {
    id: 'session_9',
    datetime: new Date(getDateOffset(3).setHours(8, 0, 0, 0)),
    clientId: 'client_4',
    clientName: 'Michael Chen',
    clientAvatar: 'MC',
    clientColor: '#12229D',
    clientCredits: 4,
    status: 'confirmed',
    serviceTypeId: 'service_2',
  },
];

/**
 * Helper functions
 */
export function getServiceType(serviceTypeId: string): ServiceType | undefined {
  return SERVICE_TYPES.find((s) => s.id === serviceTypeId);
}

export function getClient(clientId: string): CalendarClient | undefined {
  return CALENDAR_CLIENTS.find((c) => c.id === clientId);
}

export function getWorkoutTemplate(workoutId: string): WorkoutTemplate | undefined {
  return WORKOUT_TEMPLATES.find((w) => w.id === workoutId);
}
