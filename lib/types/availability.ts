// Trainer availability types

export interface AvailabilityBlock {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  isRecurring: boolean; // If true, applies every week
}

export interface TrainerAvailability {
  trainerId: string;
  blocks: AvailabilityBlock[];
}
