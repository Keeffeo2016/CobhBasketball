import React from 'react';
import { Clock, User, Trash2 } from 'lucide-react';
import { Gym, TimeSlot, Booking } from '../types/booking';
import { timeSlots } from '../data/gyms';

interface TimeSlotGridProps {
  gym: Gym;
  date: string;
  bookings: Booking[];
  onBookSlot: (gym: Gym, timeSlot: TimeSlot) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  gym,
  date,
  bookings,
  onBookSlot,
  onCancelBooking
}) => {
  const getBookingForSlot = (timeSlot: string) => {
    return bookings.find(booking => 
      booking.gymId === gym.id && 
      booking.date === date && 
      booking.timeSlot === timeSlot
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${gym.color} px-6 py-4`}>
        <h3 className="text-xl font-bold text-white">{gym.name}</h3>
        <p className="text-white/90 text-sm">{gym.location}</p>
      </div>
      
      <div className="p-6">
        <div className="grid gap-2">
          {timeSlots.map((timeSlot) => {
            const booking = getBookingForSlot(timeSlot.time);
            const isBooked = !!booking;
            
            return (
              <div
                key={timeSlot.time}
                className={`relative rounded-lg border-2 transition-all ${
                  isBooked
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                }`}
                onClick={() => !isBooked && onBookSlot(gym, timeSlot)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className={`w-4 h-4 ${isBooked ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isBooked ? 'text-green-900' : 'text-gray-700'}`}>
                        {timeSlot.display}
                      </span>
                    </div>
                    
                    {isBooked ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Booked
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelBooking(booking.id);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                  
                  {isBooked && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{booking.clientName}</span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {booking.clientPhone}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};