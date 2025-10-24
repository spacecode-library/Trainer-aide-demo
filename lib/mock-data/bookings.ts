// Mock calendar bookings for trainers

export interface Booking {
  id: string;
  trainerId: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  serviceId: string; // Reference to Service (e.g., 'service_pt_30', 'service_pt_60')
  templateId?: string; // Optional reference to WorkoutTemplate (selected when starting session)
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

// Helper to get dates relative to today
const getDateOffset = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const MOCK_BOOKINGS: Booking[] = [
  // Today's bookings - Mix of different service types
  {
    id: 'booking_1',
    trainerId: 'user_trainer_1',
    clientId: 'client_1',
    clientName: 'Tom Phillips',
    date: getDateOffset(0), // Today
    time: '09:00',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },
  {
    id: 'booking_2',
    trainerId: 'user_trainer_1',
    clientId: 'client_2',
    clientName: 'Jane Smith',
    date: getDateOffset(0), // Today
    time: '10:00',
    serviceId: 'service_pt_45', // 45-minute session
    status: 'upcoming',
  },
  {
    id: 'booking_3',
    trainerId: 'user_trainer_1',
    clientId: 'client_4',
    clientName: 'Sarah Williams',
    date: getDateOffset(0), // Today
    time: '11:30',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },
  {
    id: 'booking_4',
    trainerId: 'user_trainer_1',
    clientId: 'client_3',
    clientName: 'Mike Johnson',
    date: getDateOffset(0), // Today
    time: '14:00',
    serviceId: 'service_pt_60', // 60-minute session
    status: 'upcoming',
  },
  {
    id: 'booking_5',
    trainerId: 'user_trainer_1',
    clientId: 'client_5',
    clientName: 'Alex Brown',
    date: getDateOffset(0), // Today
    time: '15:30',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },
  {
    id: 'booking_6',
    trainerId: 'user_trainer_1',
    clientId: 'client_1',
    clientName: 'Tom Phillips',
    date: getDateOffset(0), // Today
    time: '17:00',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },

  // Yesterday
  {
    id: 'booking_yesterday_1',
    trainerId: 'user_trainer_1',
    clientId: 'client_2',
    clientName: 'Jane Smith',
    date: getDateOffset(-1),
    time: '10:00',
    serviceId: 'service_pt_30',
    status: 'completed',
  },
  {
    id: 'booking_yesterday_2',
    trainerId: 'user_trainer_1',
    clientId: 'client_3',
    clientName: 'Mike Johnson',
    date: getDateOffset(-1),
    time: '14:00',
    serviceId: 'service_pt_30',
    status: 'completed',
  },

  // Tomorrow
  {
    id: 'booking_tomorrow_1',
    trainerId: 'user_trainer_1',
    clientId: 'client_1',
    clientName: 'Tom Phillips',
    date: getDateOffset(1),
    time: '09:30',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },
  {
    id: 'booking_tomorrow_2',
    trainerId: 'user_trainer_1',
    clientId: 'client_4',
    clientName: 'Sarah Williams',
    date: getDateOffset(1),
    time: '11:00',
    serviceId: 'service_pt_75', // 75-minute extended session
    status: 'upcoming',
  },
  {
    id: 'booking_tomorrow_3',
    trainerId: 'user_trainer_1',
    clientId: 'client_5',
    clientName: 'Alex Brown',
    date: getDateOffset(1),
    time: '15:00',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },

  // Day after tomorrow
  {
    id: 'booking_day2_1',
    trainerId: 'user_trainer_1',
    clientId: 'client_2',
    clientName: 'Jane Smith',
    date: getDateOffset(2),
    time: '10:30',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },
  {
    id: 'booking_day2_2',
    trainerId: 'user_trainer_1',
    clientId: 'client_1',
    clientName: 'Tom Phillips',
    date: getDateOffset(2),
    time: '16:00',
    serviceId: 'service_pt_60', // 60-minute session
    status: 'upcoming',
  },

  // 3 days from now
  {
    id: 'booking_day3_1',
    trainerId: 'user_trainer_1',
    clientId: 'client_3',
    clientName: 'Mike Johnson',
    date: getDateOffset(3),
    time: '09:00',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },
  {
    id: 'booking_day3_2',
    trainerId: 'user_trainer_1',
    clientId: 'client_4',
    clientName: 'Sarah Williams',
    date: getDateOffset(3),
    time: '13:30',
    serviceId: 'service_pt_45', // 45-minute session
    status: 'upcoming',
  },

  // 4 days from now
  {
    id: 'booking_day4_1',
    trainerId: 'user_trainer_1',
    clientId: 'client_5',
    clientName: 'Alex Brown',
    date: getDateOffset(4),
    time: '11:00',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },
  {
    id: 'booking_day4_2',
    trainerId: 'user_trainer_1',
    clientId: 'client_1',
    clientName: 'Tom Phillips',
    date: getDateOffset(4),
    time: '14:30',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },
  {
    id: 'booking_day4_3',
    trainerId: 'user_trainer_1',
    clientId: 'client_2',
    clientName: 'Jane Smith',
    date: getDateOffset(4),
    time: '17:00',
    serviceId: 'service_pt_90', // 90-minute extended session
    status: 'upcoming',
  },

  // 5 days from now
  {
    id: 'booking_day5_1',
    trainerId: 'user_trainer_1',
    clientId: 'client_3',
    clientName: 'Mike Johnson',
    date: getDateOffset(5),
    time: '10:00',
    serviceId: 'service_pt_30',
    status: 'upcoming',
  },

  // 2 days ago
  {
    id: 'booking_2daysago_1',
    trainerId: 'user_trainer_1',
    clientId: 'client_1',
    clientName: 'Tom Phillips',
    date: getDateOffset(-2),
    time: '09:00',
    serviceId: 'service_pt_30',
    status: 'completed',
  },
  {
    id: 'booking_2daysago_2',
    trainerId: 'user_trainer_1',
    clientId: 'client_4',
    clientName: 'Sarah Williams',
    date: getDateOffset(-2),
    time: '15:00',
    serviceId: 'service_pt_30',
    status: 'completed',
  },
];
