// Booking request types for instructor-led model

export interface BookingRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  clientColor: string;
  clientCredits: number;
  serviceTypeId: string;
  locationId?: string;
  preferredTimes: Date[]; // Array of time options client suggests
  notes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date; // Auto-expire after 7 days
}

export interface BookingRequestFormData {
  clientId: string;
  serviceTypeId: string;
  preferredTimes: Date[];
  notes?: string;
}
