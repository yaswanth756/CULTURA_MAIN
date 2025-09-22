import Booking from '../models/Booking.js';

// Generate unique booking number
export const generateBookingNumber = async () => {
  const prefix = 'BK';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  let bookingNumber;
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    const sequence = String(counter).padStart(4, '0');
    bookingNumber = `${prefix}${year}${month}${day}${sequence}`;
    
    const existingBooking = await Booking.findOne({ bookingNumber });
    if (!existingBooking) {
      isUnique = true;
    } else {
      counter++;
    }
  }

  return bookingNumber;
};

// Calculate deposit amount (typically 10% of total)
export const calculateDepositAmount = (totalAmount, percentage = 0.1) => {
  return Math.round(totalAmount * percentage);
};

// Validate service date (should be in future)
export const validateServiceDate = (serviceDate) => {
  const date = new Date(serviceDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date >= today;
};
