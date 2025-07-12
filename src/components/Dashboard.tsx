import React, { useState } from 'react';
import { DateNavigator } from './DateNavigator';
import { TimeSlotGrid } from './TimeSlotGrid';
import { BookingModal } from './BookingModal';
import { gyms, getTimeSlotsForDate } from '../data/gyms';
import { useBookings } from '../hooks/useBookings';
import { Gym, TimeSlot } from '../types/booking';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [view] = useState<'daily'>('daily');
  const [exportRange, setExportRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    gym?: Gym;
    timeSlot?: TimeSlot;
    date?: string;
  }>({ isOpen: false });

  const { bookings, addBooking, removeBooking, getBookingsForDate } = useBookings();

  let filteredBookings: typeof bookings = getBookingsForDate(selectedDate);

  // Helper to calculate total available slots for a date range
  const getTotalAvailableSlots = (dates: string[]) => {
    return dates.reduce((total, date) => {
      const slotsForDate = getTimeSlotsForDate(date);
      return total + (gyms.length * slotsForDate.length);
    }, 0);
  };

  // Export logic
  const handleExport = () => {
    if (!exportRange.start || !exportRange.end) return;
    const start = new Date(exportRange.start);
    const end = new Date(exportRange.end);
    const exportBookings = bookings.filter((b: typeof bookings[number]) => {
      const bd = new Date(b.date);
      return bd >= start && bd <= end;
    });
    const headers = ['Gym Name', 'Date', 'Time Slot', 'Client Name', 'Created At'];
    const rows = exportBookings.map((b: typeof bookings[number]) => {
      const gym = gyms.find(g => g.id === b.gymId);
      return [
        gym ? gym.name : b.gymId,
        b.date,
        b.timeSlot,
        b.clientName,
        b.createdAt,
      ];
    });
    if (exportFormat === 'csv') {
      const csvRows = [headers, ...rows];
      const csvContent = csvRows.map((row: string[]) => row.map((s: string) => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings_${exportRange.start}_to_${exportRange.end}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'pdf') {
      const doc = new jsPDF();
      (doc as any).autoTable({ head: [headers], body: rows });
      doc.save(`bookings_${exportRange.start}_to_${exportRange.end}.pdf`);
    }
  };

  const handleBookSlot = (gym: Gym, timeSlot: TimeSlot, date: string) => {
    setBookingModal({
      isOpen: true,
      gym,
      timeSlot,
      date
    });
  };

  const handleConfirmBooking = (clientName: string) => {
    if (bookingModal.gym && bookingModal.timeSlot && bookingModal.date) {
      addBooking({
        gymId: bookingModal.gym.id,
        date: bookingModal.date,
        timeSlot: bookingModal.timeSlot.time,
        clientName
      });
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      removeBooking(bookingId);
    }
  };

  const totalBookings = filteredBookings.length;
  
  // Calculate available slots for daily view
  let gridDates: string[] = [selectedDate];
  
  const totalAvailableSlots = getTotalAvailableSlots(gridDates);
  const availableSlots = totalAvailableSlots - totalBookings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLs6W3yVhbL8mjuv6vMW6rjUF2Et_EYGO-Wg&s" 
                alt="Cobh Basketball Logo" 
                className="h-12 w-auto" 
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Cobh Basketball
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Gym Booking System
                </p>
              </div>
            </div>
            

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Navigator */}
        <div className="mb-8">
          <DateNavigator 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Slots</p>
                <p className="text-3xl font-bold text-gray-900">{availableSlots}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalAvailableSlots > 0 ? Math.round((totalBookings / totalAvailableSlots) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-600 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Bookings</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={exportRange.start} 
                  onChange={e => setExportRange(r => ({...r, start: e.target.value}))} 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
                <span className="flex items-center text-gray-500">to</span>
                <input 
                  type="date" 
                  value={exportRange.end} 
                  onChange={e => setExportRange(r => ({...r, end: e.target.value}))} 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select 
                value={exportFormat} 
                onChange={e => setExportFormat(e.target.value as 'csv' | 'pdf')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <button 
              onClick={handleExport} 
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Export
            </button>
          </div>
        </div>

        {/* Gym Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <div key={gym.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <TimeSlotGrid
                gym={gym}
                dates={gridDates}
                bookings={filteredBookings}
                onBookSlot={handleBookSlot}
                onCancelBooking={handleCancelBooking}
              />
            </div>
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