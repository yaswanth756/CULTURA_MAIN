import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const CustomDatePicker = ({ value, onChange, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Base month/year (current month)
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calculate next month
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  
  // Display state - starts with CURRENT month (changed from next month)
  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);
  const [isShowingNextMonth, setIsShowingNextMonth] = useState(false); // Changed to false
  
  const calendarRef = useRef(null);
  const buttonRef = useRef(null);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Toggle between current and next month
  const toggleMonth = () => {
    if (isShowingNextMonth) {
      // Switch to current month
      setDisplayMonth(currentMonth);
      setDisplayYear(currentYear);
      setIsShowingNextMonth(false);
    } else {
      // Switch to next month
      setDisplayMonth(nextMonth);
      setDisplayYear(nextMonthYear);
      setIsShowingNextMonth(true);
    }
  };
  
  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar grid
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };
  
  // Navigate months (when using arrow buttons)
  const goToPreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
    // Update toggle state based on new month
    setIsShowingNextMonth(
      (displayMonth === 0 ? 11 : displayMonth - 1) === nextMonth && 
      (displayMonth === 0 ? displayYear - 1 : displayYear) === nextMonthYear
    );
  };
  
  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
    // Update toggle state based on new month
    setIsShowingNextMonth(
      (displayMonth === 11 ? 0 : displayMonth + 1) === nextMonth && 
      (displayMonth === 11 ? displayYear + 1 : displayYear) === nextMonthYear
    );
  };
  
  // Handle date selection
  const handleDateClick = (day) => {
    if (!day) return;
    
    const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const clickedDate = new Date(displayYear, displayMonth, day);
    
    // Don't allow past dates
    if (clickedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      return;
    }
    
    onChange(dateStr);
    setIsOpen(false);
  };
  
  // Check if date is selected
  const isSelected = (day) => {
    if (!day || !value) return false;
    const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === value;
  };
  
  // Check if date is today
  const isToday = (day) => {
    if (!day) return false;
    const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === todayStr;
  };
  
  // Check if date is in the past
  const isPastDate = (day) => {
    if (!day) return false;
    const clickedDate = new Date(displayYear, displayMonth, day);
    return clickedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
  
  // Can go to previous month?
  const canGoPrevious = () => {
    if (displayYear > today.getFullYear()) return true;
    if (displayYear === today.getFullYear() && displayMonth > today.getMonth()) return true;
    return false;
  };
  
  // Format date for display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return placeholder;
    const date = new Date(dateStr + 'T00:00:00');
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
  };
  
  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);
  
  const calendarDays = generateCalendar();
  
  return (
    <div className="relative flex-1">
      {/* Date Picker Button */}
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center bg-white rounded-lg border pl-3 pr-3 py-3 text-left hover:border-anzac-300 focus:outline-none focus:ring-2 focus:ring-anzac-500 focus:border-transparent transition-colors gap-3"
      >
        <CalendarIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <span className={`flex-1 ${value ? 'text-gray-800' : 'text-gray-500'}`}>
          {formatDisplayDate(value)}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Calendar Dropdown */}
      {isOpen && (
        <div ref={calendarRef} className="absolute z-30 mt-2 left-0">
          <div className="bg-white border rounded-xl shadow-xl p-4 w-80">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                disabled={!canGoPrevious()}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <h3 className="font-semibold text-gray-900">
                {months[displayMonth]} {displayYear}
              </h3>
              
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Month Toggle Button */}
            <div className="flex justify-center mb-3">
              <button
                type="button"
                onClick={toggleMonth}
                className="px-4 py-2 text-sm rounded-lg border transition-colors hover:bg-gray-50"
              >
                {isShowingNextMonth ? (
                  <span className="text-gray-600">
                    Switch to <span className="font-medium text-anzac-600">Current Month</span>
                  </span>
                ) : (
                  <span className="text-gray-600">
                    Switch to <span className="font-medium text-anzac-600">Next Month</span>
                  </span>
                )}
              </button>
            </div>
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-9 w-9"></div>;
                }
                
                const selected = isSelected(day);
                const todayDate = isToday(day);
                const pastDate = isPastDate(day);
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={pastDate}
                    className={`
                      h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200
                      ${selected 
                        ? 'bg-anzac-500 text-white hover:bg-anzac-600' 
                        : pastDate 
                          ? 'text-gray-300 cursor-not-allowed line-through' 
                          : todayDate
                            ? 'bg-anzac-50 text-anzac-700 ring-1 ring-anzac-500 hover:bg-anzac-100'
                            : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {isShowingNextMonth ? 'Viewing next month' : 'Viewing current month'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-anzac-600 hover:text-anzac-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
