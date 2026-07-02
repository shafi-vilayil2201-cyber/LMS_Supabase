// Mentor Availability feature types
export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailabilitySchedule {
  mentorId: string;
  slots: TimeSlot[];
}
