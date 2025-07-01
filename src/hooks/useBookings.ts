import { useState, useEffect } from 'react';
import { Booking } from '../types/booking';

const STORAGE_KEY = 'gym-bookings';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings from localStorage on mount
  useEffect(() => {
    const savedBookings = localStorage.getItem(STORAGE_KEY);
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (error) {
        console.error('Error loading bookings:', error);
      }
    }
  }, []);

  // Save bookings to localStorage whenever bookings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setBookings((prev: Booking[]) => [...prev, newBooking]);
  };

  const removeBooking = (bookingId: string) => {
    setBookings((prev: Booking[]) => prev.filter((booking: Booking) => booking.id !== bookingId));
  };

  const getBookingForSlot = (gymId: string, date: string, timeSlot: string) => {
    return bookings.find((booking: Booking) => 
      booking.gymId === gymId && 
      booking.date === date && 
      booking.timeSlot === timeSlot
    );
  };

  const getBookingsForDate = (date: string) => {
    return bookings.filter((booking: Booking) => booking.date === date);
  };

  const getBookingsForWeek = (bookings: Booking[], date: string) => {
    const d = new Date(date);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday
    return bookings.filter((b: Booking) => {
      const bd = new Date(b.date);
      return bd >= start && bd <= end;
    });
  };

  const getBookingsForMonth = (bookings: Booking[], date: string) => {
    const d = new Date(date);
    const month = d.getMonth();
    const year = d.getFullYear();
    return bookings.filter((b: Booking) => {
      const bd = new Date(b.date);
      return bd.getMonth() === month && bd.getFullYear() === year;
    });
  };

  return {
    bookings,
    addBooking,
    removeBooking,
    getBookingForSlot,
    getBookingsForDate,
    getBookingsForWeek,
    getBookingsForMonth
  };
};