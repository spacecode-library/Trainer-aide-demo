// Mock trainer availability data

import type { AvailabilityBlock, TrainerAvailability } from '../types/availability';

// Default availability: Monday-Friday 6am-8pm, Saturday 7am-12pm
export const DEFAULT_TRAINER_AVAILABILITY: TrainerAvailability = {
  trainerId: 'trainer_1',
  blocks: [
    // AVAILABLE BLOCKS
    // Monday
    {
      id: 'avail_mon',
      blockType: 'available',
      dayOfWeek: 1,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      recurrence: 'weekly',
      isRecurring: true, // Backwards compatibility
    },
    // Tuesday
    {
      id: 'avail_tue',
      blockType: 'available',
      dayOfWeek: 2,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      recurrence: 'weekly',
      isRecurring: true,
    },
    // Wednesday
    {
      id: 'avail_wed',
      blockType: 'available',
      dayOfWeek: 3,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      recurrence: 'weekly',
      isRecurring: true,
    },
    // Thursday
    {
      id: 'avail_thu',
      blockType: 'available',
      dayOfWeek: 4,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      recurrence: 'weekly',
      isRecurring: true,
    },
    // Friday
    {
      id: 'avail_fri',
      blockType: 'available',
      dayOfWeek: 5,
      startHour: 6,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      recurrence: 'weekly',
      isRecurring: true,
    },
    // Saturday (limited hours)
    {
      id: 'avail_sat',
      blockType: 'available',
      dayOfWeek: 6,
      startHour: 7,
      startMinute: 0,
      endHour: 12,
      endMinute: 0,
      recurrence: 'weekly',
      isRecurring: true,
    },

    // BLOCKED BLOCKS - Sample data
    // Recurring: Lunch break Mon-Fri 12-1pm
    {
      id: 'block_lunch_mon',
      blockType: 'blocked',
      dayOfWeek: 1,
      startHour: 12,
      startMinute: 0,
      endHour: 13,
      endMinute: 0,
      recurrence: 'weekly',
      reason: 'personal',
      notes: 'Lunch break',
    },
    {
      id: 'block_lunch_tue',
      blockType: 'blocked',
      dayOfWeek: 2,
      startHour: 12,
      startMinute: 0,
      endHour: 13,
      endMinute: 0,
      recurrence: 'weekly',
      reason: 'personal',
      notes: 'Lunch break',
    },
    {
      id: 'block_lunch_wed',
      blockType: 'blocked',
      dayOfWeek: 3,
      startHour: 12,
      startMinute: 0,
      endHour: 13,
      endMinute: 0,
      recurrence: 'weekly',
      reason: 'personal',
      notes: 'Lunch break',
    },
    {
      id: 'block_lunch_thu',
      blockType: 'blocked',
      dayOfWeek: 4,
      startHour: 12,
      startMinute: 0,
      endHour: 13,
      endMinute: 0,
      recurrence: 'weekly',
      reason: 'personal',
      notes: 'Lunch break',
    },
    {
      id: 'block_lunch_fri',
      blockType: 'blocked',
      dayOfWeek: 5,
      startHour: 12,
      startMinute: 0,
      endHour: 13,
      endMinute: 0,
      recurrence: 'weekly',
      reason: 'personal',
      notes: 'Lunch break',
    },

    // Recurring: Admin time Tuesday 2-4pm
    {
      id: 'block_admin_tue',
      blockType: 'blocked',
      dayOfWeek: 2,
      startHour: 14,
      startMinute: 0,
      endHour: 16,
      endMinute: 0,
      recurrence: 'weekly',
      reason: 'admin',
      notes: 'Weekly admin tasks',
    },
  ],
};

/**
 * Check if a given time is within trainer's availability (and not blocked)
 */
export function isWithinAvailability(
  datetime: Date,
  availability: TrainerAvailability
): boolean {
  const dayOfWeek = datetime.getDay();
  const hour = datetime.getHours();
  const minute = datetime.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // Check if time is within available blocks
  const isAvailable = availability.blocks.some((block) => {
    if (block.blockType !== 'available') return false;
    if (block.dayOfWeek !== dayOfWeek) return false;

    const blockStart = block.startHour * 60 + block.startMinute;
    const blockEnd = block.endHour * 60 + block.endMinute;

    return timeInMinutes >= blockStart && timeInMinutes < blockEnd;
  });

  if (!isAvailable) return false;

  // Check if time is blocked
  const isBlocked = isTimeBlocked(datetime, availability);

  return !isBlocked;
}

/**
 * Check if a given time is blocked
 */
export function isTimeBlocked(
  datetime: Date,
  availability: TrainerAvailability
): boolean {
  const dayOfWeek = datetime.getDay();
  const hour = datetime.getHours();
  const minute = datetime.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // Get date string for comparison (YYYY-MM-DD)
  const dateStr = datetime.toISOString().split('T')[0];

  return availability.blocks.some((block) => {
    if (block.blockType !== 'blocked') return false;

    // Check recurring weekly blocks
    if (block.recurrence === 'weekly') {
      if (block.dayOfWeek !== dayOfWeek) return false;

      const blockStart = block.startHour * 60 + block.startMinute;
      const blockEnd = block.endHour * 60 + block.endMinute;

      return timeInMinutes >= blockStart && timeInMinutes < blockEnd;
    }

    // Check one-time blocks
    if (block.recurrence === 'once' && block.specificDate) {
      if (block.specificDate !== dateStr) return false;

      // If it's a full day block (no endDate specified, or endDate is same day)
      if (!block.endDate || block.endDate === block.specificDate) {
        const blockStart = block.startHour * 60 + block.startMinute;
        const blockEnd = block.endHour * 60 + block.endMinute;
        return timeInMinutes >= blockStart && timeInMinutes < blockEnd;
      }

      // If it's a multi-day block
      if (block.endDate && dateStr >= block.specificDate && dateStr <= block.endDate) {
        const blockStart = block.startHour * 60 + block.startMinute;
        const blockEnd = block.endHour * 60 + block.endMinute;
        return timeInMinutes >= blockStart && timeInMinutes < blockEnd;
      }
    }

    return false;
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
