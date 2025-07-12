import React, { useState } from 'react';
import { Clock, User, Trash2, Calendar, X, MapPin, Repeat } from 'lucide-react';
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
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);

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
      if (isRecurring) {
        // Generate recurring block bookings
        const recurringBlockSlots: BookingSlot[] = [];
        const startDate = new Date(dates[0]); // Use the first date as reference
        
        for (let week = 0; week < recurringWeeks; week++) {
          slots.forEach(slot => {
            const slotDate = new Date(slot.date);
            const recurringDate = new Date(startDate);
            recurringDate.setDate(startDate.getDate() + (week * 7));
            
            // Calculate the day offset from the original date
            const dayDiff = Math.floor((slotDate.getTime() - new Date(dates[0]).getTime()) / (1000 * 60 * 60 * 24));
            recurringDate.setDate(recurringDate.getDate() + dayDiff);
            
            recurringBlockSlots.push({
              gym: slot.gym,
              date: recurringDate.toISOString().split('T')[0],
              timeSlot: slot.timeSlot
            });
          });
        }
        
        // Book each recurring slot
        recurringBlockSlots.forEach(slot => {
          onBookSlot(slot.gym, slot.timeSlot, slot.date);
        });
      } else {
        // Book each slot individually
        slots.forEach(slot => {
          onBookSlot(slot.gym, slot.timeSlot, slot.date);
        });
      }
    }
    
    setSelectedRange(null);
    setBlockBookingMode(false);
    setShowBlockBookingModal(false);
    setIsRecurring(false);
    setRecurringWeeks(4);
  };

  const cancelBlockBooking = () => {
    setSelectedRange(null);
    setBlockBookingMode(false);
    setShowBlockBookingModal(false);
    setIsRecurring(false);
    setRecurringWeeks(4);
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

  const getRecurringBlockPreview = () => {
    if (!isRecurring) return [];
    const preview: string[] = [];
    const startDate = new Date(dates[0]);
    
    for (let week = 0; week < Math.min(recurringWeeks, 2); week++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + (week * 7));
      preview.push(`Week ${week + 1}: ${weekDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${getBlockSlots().length} slots`);
    }
    return preview;
  };

  return (
    <>
    <div className="overflow-hidden">
      {/* Gym Header */}
      <div className={`bg-gradient-to-r ${gym.color} px-6 py-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">{gym.name}</h3>
            </div>
            {gym.location && (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{gym.location}</span>
              </div>
            )}
          </div>
          
          {/* Block Booking Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setBlockBookingMode(!blockBookingMode);
                if (blockBookingMode) {
                  setSelectedRange(null);
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                blockBookingMode 
                  ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {blockBookingMode ? 'Cancel Block' : 'Block Book'}
            </button>
            
            {blockBookingMode && selectedRange && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className="text-white text-sm bg-white/20 px-3 py-1 rounded-lg">
                  {getRangeDisplayText()}
                </span>
                <button
                  onClick={handleBlockBook}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                >
                  Book Range
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Slots Table */}
      <div className="p-4 overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-2 text-left text-sm font-semibold text-gray-700 bg-gray-50 rounded-l-lg">Time</th>
                {dates.map(date => (
                  <th key={date} className="p-2 text-center text-sm font-semibold text-gray-700 bg-gray-50">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedTimeSlots.map((timeSlot) => (
                <tr key={timeSlot.time} className="hover:bg-gray-50 transition-colors">
                  <td className="p-2 text-sm font-medium text-gray-900 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {timeSlot.display}
                    </div>
                  </td>
                  {dates.map(date => {
                    const booking = getBookingForSlot(date, timeSlot.time);
                    const isBooked = !!booking;
                    const isInRange = isInSelectedRange(timeSlot);
                    const isAvailableForDate = getTimeSlotsForDate(date).some(ts => ts.time === timeSlot.time);
                    
                    return (
                      <td
                        key={date}
                        className={`p-2 text-center align-top transition-all duration-200 min-w-[80px] ${
                          !isAvailableForDate
                            ? 'bg-gray-100'
                            : isBooked
                            ? 'bg-green-50 border-l-4 border-l-green-500'
                            : isInRange
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'bg-white hover:bg-blue-50 cursor-pointer border-l-4 border-l-transparent'
                        }`}
                        onClick={() => isAvailableForDate && !isBooked && handleSlotClick(date, timeSlot)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {!isAvailableForDate ? (
                            <span className="text-xs text-gray-400 font-medium">N/A</span>
                          ) : isBooked ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                Booked
                              </span>
                              <div className="flex items-center gap-1 text-xs text-green-700">
                                <User className="w-3 h-3" />
                                <span className="font-medium truncate max-w-[60px]">{booking!.clientName}</span>
                              </div>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onCancelBooking(booking!.id);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                                title="Cancel booking"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : isInRange ? (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              Selected
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                              Available
                            </span>
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
    </div>

      {/* Block Booking Modal */}
      {showBlockBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
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

              {/* Recurring Booking Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring-block"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="recurring-block" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Repeat className="w-4 h-4" />
                    Recurring weekly booking
                  </label>
                </div>
                
                {isRecurring && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of weeks
                      </label>
                      <select
                        value={recurringWeeks}
                        onChange={(e) => setRecurringWeeks(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={2}>2 weeks</option>
                        <option value={3}>3 weeks</option>
                        <option value={4}>4 weeks</option>
                        <option value={6}>6 weeks</option>
                        <option value={8}>8 weeks</option>
                        <option value={12}>12 weeks</option>
                      </select>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <div className="space-y-1">
                        {getRecurringBlockPreview().map((weekStr, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded">
                            <Calendar className="w-3 h-3" />
                            <span>{weekStr}</span>
                          </div>
                        ))}
                        {recurringWeeks > 2 && (
                          <div className="text-xs text-gray-500 italic">
                            ... and {recurringWeeks - 2} more weeks
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                  {isRecurring ? 
                    `Book ${getBlockSlots().length * recurringWeeks} Slots (${recurringWeeks} weeks)` : 
                    `Book ${getBlockSlots().length} Slots`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};