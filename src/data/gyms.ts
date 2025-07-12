import { Gym, TimeSlot } from '../types/booking';

export const gyms: Gym[] = [
  {
    id: 'gym-1',
    name: 'Colaiste Muire',
    location: 'Cobh, Co. Cork',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'gym-2',
    name: 'Rushbrooke',
    location: 'Rushbrooke, Cobh',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'gym-3',
    name: 'Community Centre',
    location: 'Cobh Town Centre',
    color: 'from-purple-500 to-purple-600'
  }
];

// Weekday time slots (Monday-Friday): 5:00 PM - 10:00 PM
export const weekdayTimeSlots: TimeSlot[] = [
  { time: '17:00', display: '5:00 PM' },
  { time: '17:30', display: '5:30 PM' },
  { time: '18:00', display: '6:00 PM' },
  { time: '18:30', display: '6:30 PM' },
  { time: '19:00', display: '7:00 PM' },
  { time: '19:30', display: '7:30 PM' },
  { time: '20:00', display: '8:00 PM' },
  { time: '20:30', display: '8:30 PM' },
  { time: '21:00', display: '9:00 PM' },
  { time: '21:30', display: '9:30 PM' },
  { time: '22:00', display: '10:00 PM' }
];

// Weekend time slots (Saturday-Sunday): 9:00 AM - 8:00 PM
export const weekendTimeSlots: TimeSlot[] = [
  { time: '09:00', display: '9:00 AM' },
  { time: '09:30', display: '9:30 AM' },
  { time: '10:00', display: '10:00 AM' },
  { time: '10:30', display: '10:30 AM' },
  { time: '11:00', display: '11:00 AM' },
  { time: '11:30', display: '11:30 AM' },
  { time: '12:00', display: '12:00 PM' },
  { time: '12:30', display: '12:30 PM' },
  { time: '13:00', display: '1:00 PM' },
  { time: '13:30', display: '1:30 PM' },
  { time: '14:00', display: '2:00 PM' },
  { time: '14:30', display: '2:30 PM' },
  { time: '15:00', display: '3:00 PM' },
  { time: '15:30', display: '3:30 PM' },
  { time: '16:00', display: '4:00 PM' },
  { time: '16:30', display: '4:30 PM' },
  { time: '17:00', display: '5:00 PM' },
  { time: '17:30', display: '5:30 PM' },
  { time: '18:00', display: '6:00 PM' },
  { time: '18:30', display: '6:30 PM' },
  { time: '19:00', display: '7:00 PM' },
  { time: '19:30', display: '7:30 PM' },
  { time: '20:00', display: '8:00 PM' }
];

// Helper function to get time slots based on date
export const getTimeSlotsForDate = (date: string): TimeSlot[] => {
  const dayOfWeek = new Date(date).getDay();
  // 0 = Sunday, 6 = Saturday
  return (dayOfWeek === 0 || dayOfWeek === 6) ? weekendTimeSlots : weekdayTimeSlots;
};

// Legacy export for backward compatibility
export const timeSlots = weekdayTimeSlots;
