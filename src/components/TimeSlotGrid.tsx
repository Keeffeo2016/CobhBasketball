import React, { useState } from 'react';
import { Clock, User, Trash2, Calendar, X } from 'lucide-react';
import { Gym, TimeSlot, Booking } from '../types/booking';
import { getTimeSlotsForDate } from '../data/gyms';

interface TimeSlotGridProps {
  gym: Gym;
  dates: string[]; // array of date strings (for daily, weekly, monthly)
  bookings: Booking[];
  onBookSlot: (gym: Gym, timeSlot: TimeSlot, date: string) => void;
  onCancelBooking: (bookingId: string) => void;
}

interface BookingSlot {
  gym: Gym;
  date: string;
  timeSlot: TimeSlot;
}

interface TimeRange {
  startTime: string;
  endTime: string;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  gym,
  dates,
  bookings,
  onBookSlot,
  onCancelBooking
}) => {
  const [blockBookingMode, setBlockBookingMode] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange | null>(null);
  const [showBlockBookingModal, setShowBlockBookingModal] = useState(false);

  const getBookingForSlot = (date: string, timeSlot: string) => {
    return bookings.find(
      booking => booking.gymId === gym.id && booking.date === date && booking.timeSlot === timeSlot
    );
  };

  const handleSlotClick = (date: string, timeSlot: TimeSlot) => {
    if (blockBookingMode) {
      if (!selectedRange) {
        // First click - set start time
        setSelectedRange({ startTime: timeSlot.time, endTime: timeSlot.time });
      } else {
        // Second click - set end time
        const startTime = selectedRange.startTime;
        const endTime = timeSlot.time;
        
        // Ensure start time is before end time
        if (startTime <= endTime) {
          setSelectedRange({ startTime, endTime });
        } else {
          setSelectedRange({ startTime: endTime, endTime: startTime });
        }
      }
    } else {
      const booking = getBookingForSlot(date, timeSlot.time);
      if (!booking) {
        onBookSlot(gym, timeSlot, date);
      }
    }
  };

  const handleBlockBook = () => {
    if (!selectedRange) return;
    setShowBlockBookingModal(true);
  };

  const handleConfirmBlockBooking = (clientName: string, slots?: BookingSlot[]) => {
    if (slots && slots.length > 0) {
      // Book each slot individually
      slots.forEach(slot => {
        onBookSlot(slot.gym, slot.timeSlot, slot.date);
      });
    }
    
    setSelectedRange(null);
    setBlockBookingMode(false);
    setShowBlockBookingModal(false);
  };

  const cancelBlockBooking = () => {
    setSelectedRange(null);
    setBlockBookingMode(false);
    setShowBlockBookingModal(false);
  };

  // Get all unique time slots across all dates
  const allTimeSlots = new Set<TimeSlot>();
  dates.forEach(date => {
    const slotsForDate = getTimeSlotsForDate(date);
    slotsForDate.forEach(slot => {
      allTimeSlots.add(slot);
    });
  });

  const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => a.time.localeCompare(b.time));

  // Check if a time slot is within the selected range
  const isInSelectedRange = (timeSlot: TimeSlot) => {
    if (!selectedRange) return false;
    return timeSlot.time >= selectedRange.startTime && timeSlot.time <= selectedRange.endTime;
  };

  // Get all slots within the selected range for all dates
  const getBlockSlots = (): BookingSlot[] => {
    if (!selectedRange) return [];
    
    const slots: BookingSlot[] = [];
    dates.forEach(date => {
      const slotsForDate = getTimeSlotsForDate(date);
      slotsForDate.forEach(slot => {
        if (slot.time >= selectedRange.startTime && slot.time <= selectedRange.endTime) {
          // Check if slot is not already booked
          const booking = getBookingForSlot(date, slot.time);
          if (!booking) {
            slots.push({ gym, date, timeSlot: slot });
          }
        }
      });
    });
    
    return slots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.timeSlot.time.localeCompare(b.timeSlot.time);
    });
  };

  const getRangeDisplayText = () => {
    if (!selectedRange) return '';
    const startSlot = sortedTimeSlots.find(s => s.time === selectedRange.startTime);
    const endSlot = sortedTimeSlots.find(s => s.time === selectedRange.endTime);
    if (startSlot && endSlot) {
      return `${startSlot.display} - ${endSlot.display}`;
    }
    return '';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${gym.color} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{gym.name}</h3>
              <p className="text-white/90 text-sm">{gym.location}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBlockBookingMode(!blockBookingMode);
                  if (blockBookingMode) {
                    setSelectedRange(null);
                  }
                }}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  blockBookingMode 
                    ? 'bg-white text-blue-600 hover:bg-blue-50' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                {blockBookingMode ? 'Cancel Block' : 'Block Book'}
              </button>
              {blockBookingMode && selectedRange && (
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">
                    {getRangeDisplayText()}
                  </span>
                  <button
                    onClick={handleBlockBook}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Book Range
                  </button>
                </div>
              )}
            </div>
          </div>
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
              {sortedTimeSlots.map((timeSlot) => (
                <tr key={timeSlot.time}>
                  <td className="p-2 border-b text-xs font-medium text-gray-700 whitespace-nowrap">{timeSlot.display}</td>
                  {dates.map(date => {
                    const booking = getBookingForSlot(date, timeSlot.time);
                    const isBooked = !!booking;
                    const isInRange = isInSelectedRange(timeSlot);
                    const isAvailableForDate = getTimeSlotsForDate(date).some(ts => ts.time === timeSlot.time);
                    
                    return (
                      <td
                        key={date}
                        className={`p-2 border-b text-center align-top ${
                          !isAvailableForDate
                            ? 'bg-gray-100 border-gray-200'
                            : isBooked
                            ? 'bg-green-50 border-green-200'
                            : isInRange
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-blue-50 cursor-pointer'
                        }`}
                        onClick={() => isAvailableForDate && !isBooked && handleSlotClick(date, timeSlot)}
                      >
                        <div className="flex flex-col items-center">
                          <Clock className={`w-4 h-4 mx-auto ${
                            isBooked ? 'text-green-600' : 
                            isInRange ? 'text-blue-600' : 
                            isAvailableForDate ? 'text-gray-400' : 'text-gray-300'
                          }`} />
                          {!isAvailableForDate ? (
                            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-full">N/A</span>
                          ) : isBooked ? (
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
                              </div>
                            </>
                          ) : isInRange ? (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Range</span>
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

      {/* Block Booking Modal */}
      {showBlockBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Block Booking - {getRangeDisplayText()}
              </h2>
              <button
                onClick={cancelBlockBooking}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gym.color}`} />
                  <span className="font-medium">{gym.name}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Time Range: {getRangeDisplayText()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Available slots: {getBlockSlots().length}</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {getBlockSlots().map((slot, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - {slot.timeSlot.display}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter client name"
                    id="block-booking-client-name"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cancelBlockBooking}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const clientName = (document.getElementById('block-booking-client-name') as HTMLInputElement)?.value;
                    if (clientName?.trim()) {
                      handleConfirmBlockBooking(clientName.trim(), getBlockSlots());
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book {getBlockSlots().length} Slots
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};