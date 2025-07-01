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
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [exportRange, setExportRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    gym?: Gym;
    timeSlot?: TimeSlot;
    date?: string;
  }>({ isOpen: false });

  const { bookings, addBooking, removeBooking, getBookingsForDate } = useBookings();

  // Helper to get bookings for week
  const getBookingsForWeek = (date: string) => {
    const d = new Date(date);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday
    return bookings.filter((b: typeof bookings[number]) => {
      const bd = new Date(b.date);
      return bd >= start && bd <= end;
    });
  };
  // Helper to get bookings for month
  const getBookingsForMonth = (date: string) => {
    const d = new Date(date);
    const month = d.getMonth();
    const year = d.getFullYear();
    return bookings.filter((b: typeof bookings[number]) => {
      const bd = new Date(b.date);
      return bd.getMonth() === month && bd.getFullYear() === year;
    });
  };
  let filteredBookings: typeof bookings = [];
  if (view === 'daily') filteredBookings = getBookingsForDate(selectedDate);
  else if (view === 'weekly') filteredBookings = getBookingsForWeek(selectedDate);
  else filteredBookings = getBookingsForMonth(selectedDate);

  // Export logic
  const handleExport = () => {
    if (!exportRange.start || !exportRange.end) return;
    const start = new Date(exportRange.start);
    const end = new Date(exportRange.end);
    const exportBookings = bookings.filter((b: typeof bookings[number]) => {
      const bd = new Date(b.date);
      return bd >= start && bd <= end;
    });
    const csvRows = [
      ['Gym Name', 'Date', 'Time Slot', 'Client Name', 'Client Phone', 'Created At'],
      ...exportBookings.map((b: typeof bookings[number]) => {
        const gym = gyms.find(g => g.id === b.gymId);
        return [
          gym ? gym.name : b.gymId,
          b.date,
          b.timeSlot,
          b.clientName,
          b.clientPhone,
          b.createdAt,
        ];
      }),
    ];
    const csvContent = csvRows.map((row: string[]) => row.map((s: string) => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${exportRange.start}_to_${exportRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBookSlot = (gym: Gym, timeSlot: TimeSlot, date: string) => {
    setBookingModal({
      isOpen: true,
      gym,
      timeSlot,
      date
    });
  };

  const handleConfirmBooking = (clientName: string, clientPhone: string) => {
    if (bookingModal.gym && bookingModal.timeSlot && bookingModal.date) {
      addBooking({
        gymId: bookingModal.gym.id,
        date: bookingModal.date,
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

  const totalBookings = filteredBookings.length;
  const availableSlots = gyms.length * 11 - totalBookings; // 11 slots per gym

  // Helper to get array of dates for week
  const getWeekDates = (date: string) => {
    const d = new Date(date);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay()); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const dt = new Date(start);
      dt.setDate(start.getDate() + i);
      return dt.toISOString().split('T')[0];
    });
  };
  let gridDates: string[] = [];
  if (view === 'daily') gridDates = [selectedDate];
  else if (view === 'weekly') gridDates = getWeekDates(selectedDate);

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

        {/* View Switcher */}
        <div className="flex gap-4 mb-4">
          <button onClick={() => setView('daily')} className={`px-4 py-2 rounded-lg border ${view==='daily'?'bg-blue-600 text-white':'bg-white text-gray-700'}`}>Daily</button>
          <button onClick={() => setView('weekly')} className={`px-4 py-2 rounded-lg border ${view==='weekly'?'bg-blue-600 text-white':'bg-white text-gray-700'}`}>Weekly</button>
        </div>

        {/* Export Section */}
        <div className="flex gap-2 items-center mb-4">
          <label className="text-gray-700">Export from</label>
          <input type="date" value={exportRange.start} onChange={e => setExportRange(r => ({...r, start: e.target.value}))} className="border rounded px-2 py-1" />
          <label className="text-gray-700">to</label>
          <input type="date" value={exportRange.end} onChange={e => setExportRange(r => ({...r, end: e.target.value}))} className="border rounded px-2 py-1" />
          <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-lg">Export</button>
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
              dates={gridDates}
              bookings={filteredBookings}
              onBookSlot={handleBookSlot}
              onCancelBooking={handleCancelBooking}
            />
          ))}
        </div>

        <BookingModal
          isOpen={bookingModal.isOpen}
          onClose={() => setBookingModal({ isOpen: false })}
          gym={bookingModal.gym!}
          date={bookingModal.date || selectedDate}
          timeSlot={bookingModal.timeSlot!}
          onConfirm={handleConfirmBooking}
        />
      </div>
    </div>
  );
};