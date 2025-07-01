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
    setBookings(prev => [...prev, newBooking]);
  };

  const removeBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const getBookingForSlot = (gymId: string, date: string, timeSlot: string) => {
    return bookings.find(booking => 
      booking.gymId === gymId && 
      booking.date === date && 
      booking.timeSlot === timeSlot
    );
  };

  const getBookingsForDate = (date: string) => {
    return bookings.filter(booking => booking.date === date);
  };

  return {
    bookings,
    addBooking,
    removeBooking,
    getBookingForSlot,
    getBookingsForDate
  };
};