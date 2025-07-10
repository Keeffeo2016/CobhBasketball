import React, { useState } from 'react';
import { X, User, Phone, Calendar, Clock } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    if (isBlockBooking && blockSlots.length > 0) {
      onConfirm(clientName.trim(), blockSlots);
    } else {
      onConfirm(clientName.trim());
    }
    
    setClientName('');
    setIsSubmitting(false);
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

  const slotsToShow = isBlockBooking && blockSlots.length > 0 ? blockSlots : [{ gym, date, timeSlot }];

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
              {isSubmitting ? 'Booking...' : isBlockBooking ? `Book ${blockSlots.length} Slots` : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};