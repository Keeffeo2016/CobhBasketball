import React, { useState } from 'react';
import { DateNavigator } from './DateNavigator';
import { TimeSlotGrid } from './TimeSlotGrid';
import { BookingModal } from './BookingModal';
import { gyms } from '../data/gyms';
import { useBookings } from '../hooks/useBookings';
import { Gym, TimeSlot } from '../types/booking';

export const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    gym?: Gym;
    timeSlot?: TimeSlot;
  }>({ isOpen: false });

  const { bookings, addBooking, removeBooking, getBookingsForDate } = useBookings();
  const dayBookings = getBookingsForDate(selectedDate);

  const handleBookSlot = (gym: Gym, timeSlot: TimeSlot) => {
    setBookingModal({
      isOpen: true,
      gym,
      timeSlot
    });
  };

  const handleConfirmBooking = (clientName: string, clientPhone: string) => {
    if (bookingModal.gym && bookingModal.timeSlot) {
      addBooking({
        gymId: bookingModal.gym.id,
        date: selectedDate,
        timeSlot: bookingModal.timeSlot.time,
        clientName,
        clientPhone
      });
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      removeBooking(bookingId);
    }
  };

  const totalBookings = dayBookings.length;
  const availableSlots = gyms.length * 11 - totalBookings; // 11 slots per gym

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gym Booking Manager
          </h1>
          <p className="text-gray-600">
            Manage bookings across your gym locations
          </p>
        </div>

        <DateNavigator 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Slots</p>
                <p className="text-2xl font-bold text-gray-900">{availableSlots}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 rounded-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((totalBookings / (gyms.length * 11)) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-600 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <TimeSlotGrid
              key={gym.id}
              gym={gym}
              date={selectedDate}
              bookings={dayBookings}
              onBookSlot={handleBookSlot}
              onCancelBooking={handleCancelBooking}
            />
          ))}
        </div>

        <BookingModal
          isOpen={bookingModal.isOpen}
          onClose={() => setBookingModal({ isOpen: false })}
          gym={bookingModal.gym!}
          date={selectedDate}
          timeSlot={bookingModal.timeSlot!}
          onConfirm={handleConfirmBooking}
        />
      </div>
    </div>
  );
};