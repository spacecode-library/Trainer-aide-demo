// Session completion types

export interface SessionCompletion {
  sessionId: string;
  completedAt: Date;
  rpe: number; // Rate of Perceived Exertion (1-10)
  notes: string;
  exercisesCompleted: string[];
  clientFeedback?: string;
}

export interface SessionCompletionFormData {
  rpe: number;
  notes: string;
}
