// Trainer availability types

export type BlockType = 'available' | 'blocked';
export type RecurrenceType = 'once' | 'weekly';
export type BlockReasonType = 'vacation' | 'personal' | 'training' | 'admin' | 'other';

export interface AvailabilityBlock {
  id: string;
  blockType: BlockType; // 'available' = can book, 'blocked' = cannot book
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  recurrence: RecurrenceType; // 'once' = one-time, 'weekly' = repeats weekly
  specificDate?: string; // For one-time blocks (YYYY-MM-DD format)
  endDate?: string; // For multi-day blocks (YYYY-MM-DD format)
  reason?: BlockReasonType; // Why the time is blocked
  notes?: string; // Optional additional notes
  isRecurring?: boolean; // DEPRECATED: Use recurrence instead (kept for backwards compatibility)
}

export interface TrainerAvailability {
  trainerId: string;
  blocks: AvailabilityBlock[];
}
