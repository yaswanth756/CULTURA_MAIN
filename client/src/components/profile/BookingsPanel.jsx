import React, { useState } from "react";

// TODO: Replace with API call when backend is ready
const dummyBookings = [
  {
    id: "book_1",
    bookingNumber: "BK-2025001", 
    title: "Wedding Photography Premium",
    vendor: "Creative Wedding Films",
    date: "2025-12-15",
    location: "Hyderabad",
    amount: 65000,
    status: "upcoming"
  },
  {
    id: "book_2",
    bookingNumber: "BK-2024089",
    title: "Engagement Ceremony Decoration", 
    vendor: "Elegant Event Planners",
    date: "2024-10-20",
    location: "Chennai", 
    amount: 35000,
    status: "completed"
  },
  {
    id: "book_3",
    bookingNumber: "BK-2024056",
    title: "Birthday Party Planning", 
    vendor: "Fun Events Co",
    date: "2024-08-10",
    location: "Mumbai", 
    amount: 15000,
    status: "cancelled"
  }
];

const BookingsPanel = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [bookings, setBookings] = useState(dummyBookings);

  const filters = ["All", "Upcoming", "Completed", "Cancelled"];

  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === "All") return true;
    return booking.status === activeFilter.toLowerCase();
  });

  const handleCancelBooking = (bookingId) => {
    // TODO: Call API to cancel booking
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' }
        : booking
    ));
    alert("Booking cancelled successfully!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div data-aos="fade-up" className="max-w-6xl">
      <h2 className="text-3xl font-semibold mb-8">My bookings</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeFilter === filter 
                    ? "bg-gray-900 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter} ({filter === "All" ? bookings.length : bookings.filter(b => b.status === filter.toLowerCase()).length})
              </button>
            ))}
          </div>
        </div>
        
        <div className="divide-y">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking, idx) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{booking.title}</h3>
                    <p className="text-gray-600 mb-2">{booking.vendor}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{booking.location}</span>
                      <span>•</span>
                      <span>{booking.bookingNumber}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="font-semibold text-lg">₹{booking.amount.toLocaleString()}</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    {booking.status === "upcoming" && (
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 text-sm hover:text-red-800 mt-2"
                      >
                        Cancel booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No bookings found for "{activeFilter}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPanel;
