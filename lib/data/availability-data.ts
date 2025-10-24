// Mock trainer availability data

import type { AvailabilityBlock, TrainerAvailability } from '../types/availability';

// Default availability: Monday-Friday 6am-8pm, Saturday 7am-12pm
export const DEFAULT_TRAINER_AVAILABILITY: TrainerAvailability = {
  trainerId: 'trainer_1',
  blocks: [
    // Monday
    {
      id: 'avail_mon',
      dayOfWeek: 1,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      isRecurring: true,
    },
    // Tuesday
    {
      id: 'avail_tue',
      dayOfWeek: 2,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      isRecurring: true,
    },
    // Wednesday
    {
      id: 'avail_wed',
      dayOfWeek: 3,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      isRecurring: true,
    },
    // Thursday
    {
      id: 'avail_thu',
      dayOfWeek: 4,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      isRecurring: true,
    },
    // Friday
    {
      id: 'avail_fri',
      dayOfWeek: 5,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      isRecurring: true,
    },
    // Saturday (limited hours)
    {
      id: 'avail_sat',
      dayOfWeek: 6,
      startHour: 7,
      startMinute: 0,
      endHour: 12,
      endMinute: 0,
      isRecurring: true,
    },
  ],
};

/**
 * Check if a given time is within trainer's availability
 */
export function isWithinAvailability(
  datetime: Date,
  availability: TrainerAvailability
): boolean {
  const dayOfWeek = datetime.getDay();
  const hour = datetime.getHours();
  const minute = datetime.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  return availability.blocks.some((block) => {
    if (block.dayOfWeek !== dayOfWeek) return false;

    const blockStart = block.startHour * 60 + block.startMinute;
    const blockEnd = block.endHour * 60 + block.endMinute;

    return timeInMinutes >= blockStart && timeInMinutes < blockEnd;
  });
}

/**
 * Get availability block for a specific day
 */
export function getAvailabilityForDay(
  dayOfWeek: number,
  availability: TrainerAvailability
): AvailabilityBlock | null {
  return availability.blocks.find((block) => block.dayOfWeek === dayOfWeek) || null;
}
