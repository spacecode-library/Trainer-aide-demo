// Mock booking requests for instructor-led model

import type { BookingRequest } from '../types/booking-request';
import { CALENDAR_CLIENTS } from './calendar-data';

const getDateOffset = (days: number, hour: number, minute: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const MOCK_BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: 'request_1',
    clientId: 'client_2',
    clientName: 'James Wilson',
    clientAvatar: '👨',
    clientColor: '#12229D',
    clientCredits: 5,
    serviceTypeId: 'service_1',
    preferredTimes: [
      getDateOffset(1, 9, 0),
      getDateOffset(1, 10, 0),
      getDateOffset(2, 9, 0),
    ],
    notes: 'Would prefer morning sessions if possible',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  },
  {
    id: 'request_2',
    clientId: 'client_4',
    clientName: 'Michael Chen',
    clientAvatar: '👨‍🦱',
    clientColor: '#12229D',
    clientCredits: 4,
    serviceTypeId: 'service_2',
    preferredTimes: [
      getDateOffset(3, 14, 0),
      getDateOffset(3, 15, 0),
      getDateOffset(4, 14, 0),
    ],
    notes: 'Need extended session for strength training',
    status: 'pending',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
  },
  {
    id: 'request_3',
    clientId: 'client_5',
    clientName: 'Lisa Anderson',
    clientAvatar: '👱‍♀️',
    clientColor: '#F4B324',
    clientCredits: 3,
    serviceTypeId: 'service_1',
    preferredTimes: [
      getDateOffset(2, 11, 0),
      getDateOffset(2, 16, 0),
    ],
    notes: 'Flexible with times, just let me know!',
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
  },
];

export function getBookingRequest(requestId: string): BookingRequest | undefined {
  return MOCK_BOOKING_REQUESTS.find((r) => r.id === requestId);
}
