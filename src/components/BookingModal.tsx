import React, { useState } from 'react';
import { X, User, Calendar, Clock, Repeat } from 'lucide-react';
import { Gym, TimeSlot } from '../types/booking';

interface BookingSlot {
  gym: Gym;
  date: string;
  timeSlot: TimeSlot;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  gym: Gym;
  date: string;
  timeSlot: TimeSlot;
  onConfirm: (clientName: string, slots?: BookingSlot[]) => void;
  isBlockBooking?: boolean;
  blockSlots?: BookingSlot[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  gym,
  date,
  timeSlot,
  onConfirm,
  isBlockBooking = false,
  blockSlots = []
}) => {
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    if (isBlockBooking && blockSlots.length > 0) {
      if (isRecurring) {
        // Generate recurring block bookings
        const recurringBlockSlots: BookingSlot[] = [];
        const startDate = new Date(date);
        
        for (let week = 0; week < recurringWeeks; week++) {
          blockSlots.forEach(slot => {
            const slotDate = new Date(slot.date);
            const recurringDate = new Date(startDate);
            recurringDate.setDate(startDate.getDate() + (week * 7));
            
            // Calculate the day offset from the original date
            const dayDiff = Math.floor((slotDate.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
            recurringDate.setDate(recurringDate.getDate() + dayDiff);
            
            recurringBlockSlots.push({
              gym: slot.gym,
              date: recurringDate.toISOString().split('T')[0],
              timeSlot: slot.timeSlot
            });
          });
        }
        onConfirm(clientName.trim(), recurringBlockSlots);
      } else {
        onConfirm(clientName.trim(), blockSlots);
      }
    } else if (isRecurring) {
      // Generate recurring slots for single booking
      const recurringSlots: BookingSlot[] = [];
      const startDate = new Date(date);
      
      for (let i = 0; i < recurringWeeks; i++) {
        const slotDate = new Date(startDate);
        slotDate.setDate(startDate.getDate() + (i * 7));
        recurringSlots.push({
          gym,
          date: slotDate.toISOString().split('T')[0],
          timeSlot
        });
      }
      onConfirm(clientName.trim(), recurringSlots);
    } else {
      onConfirm(clientName.trim());
    }
    
    setClientName('');
    setIsSubmitting(false);
    setIsRecurring(false);
    setRecurringWeeks(4);
    onClose();
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRecurringPreview = () => {
    if (!isRecurring) return [];
    const preview: string[] = [];
    const startDate = new Date(date);
    
    for (let i = 0; i < Math.min(recurringWeeks, 4); i++) {
      const slotDate = new Date(startDate);
      slotDate.setDate(startDate.getDate() + (i * 7));
      preview.push(slotDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }));
    }
    return preview;
  };

  const getRecurringBlockPreview = () => {
    if (!isRecurring || !isBlockBooking || blockSlots.length === 0) return [];
    const preview: string[] = [];
    const startDate = new Date(date);
    
    for (let week = 0; week < Math.min(recurringWeeks, 2); week++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + (week * 7));
      preview.push(`Week ${week + 1}: ${weekDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${blockSlots.length} slots`);
    }
    return preview;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isBlockBooking ? `Block Booking (${blockSlots.length} slots)` : 'New Booking'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gym.color}`} />
              <span className="font-medium">{gym.name}</span>
            </div>
            
            {isBlockBooking && blockSlots.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Multiple dates and times</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {blockSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(slot.date)} - {slot.timeSlot.display}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{timeSlot.display}</span>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client name"
                required
              />
            </div>
          </div>

          {/* Recurring Booking Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="flex items-center gap-2 text-sm font-medium text-gray-700">
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
                    {isBlockBooking ? (
                      // Block booking recurring preview
                      getRecurringBlockPreview().map((weekStr, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded">
                          <Calendar className="w-3 h-3" />
                          <span>{weekStr}</span>
                        </div>
                      ))
                    ) : (
                      // Single booking recurring preview
                      getRecurringPreview().map((dateStr, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded">
                          <Calendar className="w-3 h-3" />
                          <span>{dateStr} - {timeSlot.display}</span>
                        </div>
                      ))
                    )}
                    {recurringWeeks > (isBlockBooking ? 2 : 4) && (
                      <div className="text-xs text-gray-500 italic">
                        ... and {recurringWeeks - (isBlockBooking ? 2 : 4)} more weeks
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
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !clientName.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Booking...' : 
               isBlockBooking ? 
                 (isRecurring ? `Book ${blockSlots.length * recurringWeeks} Slots (${recurringWeeks} weeks)` : `Book ${blockSlots.length} Slots`) : 
               isRecurring ? `Book ${recurringWeeks} Weeks` : 
               'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};