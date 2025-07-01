import React from 'react';
import { Clock, User, Trash2 } from 'lucide-react';
import { Gym, TimeSlot, Booking } from '../types/booking';
import { timeSlots } from '../data/gyms';

interface TimeSlotGridProps {
  gym: Gym;
  dates: string[]; // array of date strings (for daily, weekly, monthly)
  bookings: Booking[];
  onBookSlot: (gym: Gym, timeSlot: TimeSlot, date: string) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  gym,
  dates,
  bookings,
  onBookSlot,
  onCancelBooking
}) => {
  const getBookingForSlot = (date: string, timeSlot: string) => {
    return bookings.find(
      booking => booking.gymId === gym.id && booking.date === date && booking.timeSlot === timeSlot
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${gym.color} px-6 py-4`}>
        <h3 className="text-xl font-bold text-white">{gym.name}</h3>
        <p className="text-white/90 text-sm">{gym.location}</p>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border-b"></th>
              {dates.map(date => (
                <th key={date} className="p-2 border-b text-center text-xs font-semibold text-gray-700">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot) => (
              <tr key={timeSlot.time}>
                <td className="p-2 border-b text-xs font-medium text-gray-700 whitespace-nowrap">{timeSlot.display}</td>
                {dates.map(date => {
                  const booking = getBookingForSlot(date, timeSlot.time);
                  const isBooked = !!booking;
                  return (
                    <td
                      key={date}
                      className={`p-2 border-b text-center align-top ${
                        isBooked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:bg-blue-50 cursor-pointer'
                      }`}
                      onClick={() => !isBooked && onBookSlot(gym, timeSlot, date)}
                    >
                      <div className="flex flex-col items-center">
                        <Clock className={`w-4 h-4 mx-auto ${isBooked ? 'text-green-600' : 'text-gray-400'}`} />
                        {isBooked ? (
                          <>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Booked</span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onCancelBooking(booking!.id);
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors mt-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="mt-1 text-xs text-green-700 flex flex-col items-center">
                              <User className="w-4 h-4 inline-block mr-1" />
                              <span className="font-medium">{booking!.clientName}</span>
                              <span className="text-green-600">{booking!.clientPhone}</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Available</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};