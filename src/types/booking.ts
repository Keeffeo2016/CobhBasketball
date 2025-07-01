export interface Booking {
  id: string;
  gymId: string;
  date: string;
  timeSlot: string;
  clientName: string;
  clientPhone?: string;
  createdAt: string;
}

export interface Gym {
  id: string;
  name: string;
  location?: string;
  color: string;
}

export interface TimeSlot {
  time: string;
  display: string;
}