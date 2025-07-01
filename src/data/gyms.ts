import { Gym, TimeSlot } from '../types/booking';

export const gyms: Gym[] = [
  {
    id: 'gym-1',
    name: 'Coral Leisure Cobh',
    location: 'Carrignafoy, Cobh, Co. Cork, P24 X953',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'gym-2',
    name: 'Next Generation Gym',
    location: 'Unit 4B, Ticknock Retail Park, Cobh, Co. Cork',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'gym-3',
    name: 'NUADHA Fitness',
    location: '7P24 HF79, Tay Road, Cobh, Co. Cork',
    color: 'from-purple-500 to-purple-600'
  }
];

export const timeSlots: TimeSlot[] = [
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
