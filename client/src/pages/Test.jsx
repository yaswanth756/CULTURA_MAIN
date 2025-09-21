import React, { useEffect, useState } from "react";
import {
  User,
  Heart,
  Calendar,
  Settings,
  LogOut,
  Star,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Camera,
  MessageSquare
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

// Dummy user data based on your schema
const dummyUser = {
  id: "user_123",
  email: "priya@example.com", 
  phone: "+91-9876543210",
  profile: {
    firstName: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=200&h=200&fit=crop&crop=faces",
  },
  location: {
    city: "Hyderabad",
    address: "Banjara Hills, Road No. 10"
  },
  role: "customer",
  stats: {
    completedBookings: 12,
    upcomingBookings: 3,
    favorites: 8,
    reviewsWritten: 5
  }
};

// Dummy favorites
const dummyFavorites = [
  {
    id: "fav_1", 
    title: "Creative Wedding Films",
    category: "videography",
    rating: 4.9,
    reviews: 156,
    price: 45000,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop"
  },
  {
    id: "fav_2",
    title: "Elegant Event Planners", 
    category: "planning",
    rating: 4.7,
    reviews: 89,
    price: 25000,
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop"
  }
];

// Dummy bookings  
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
  }
];

const Test = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [user, setUser] = useState(dummyUser);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  const sidebarItems = [
    { key: "about", label: "About me", icon: User },
    { key: "bookings", label: "My bookings", icon: Calendar },
    { key: "favorites", label: "Saved vendors", icon: Heart },
    { key: "reviews", label: "My reviews", icon: MessageSquare },
    { key: "settings", label: "Account settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        </div>
        
        <nav className="p-4">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-4 px-4 py-3 mb-2 rounded-xl text-left transition-all ${
                activeTab === item.key 
                ? "bg-gray-900 text-white shadow-lg" 
                : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeTab === item.key ? "bg-white/20" : "bg-gray-100"
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={() => alert("Logging out...")}
            className="w-full flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === "about" && <AboutMePanel user={user} onEdit={() => setShowEditModal(true)} />}
        {activeTab === "bookings" && <BookingsPanel bookings={dummyBookings} />}
        {activeTab === "favorites" && <FavoritesPanel favorites={dummyFavorites} />}
        {activeTab === "reviews" && <ReviewsPanel />}
        {activeTab === "settings" && <SettingsPanel user={user} />}
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <EditModal 
          user={user} 
          onClose={() => setShowEditModal(false)}
          onSave={(data) => {
            setUser(prev => ({...prev, profile: {...prev.profile, ...data}}));
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

// About Me Panel
const AboutMePanel = ({ user, onEdit }) => (
  <div data-aos="fade-up" className="max-w-4xl">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-semibold text-gray-900">About me</h2>
      <button 
        onClick={onEdit}
        className="text-gray-600 hover:text-gray-900 font-medium"
      >
        Edit
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Info */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.profile.firstName?.charAt(0) || "U"}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-gray-900 rounded-full flex items-center justify-center hover:bg-gray-50">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{user.profile.firstName}</h3>
              <p className="text-gray-500 text-lg">Guest</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-5 h-5" />  
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{user.location.city}, {user.location.address}</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-gray-600" />
            <h4 className="text-xl font-semibold">Reviews I've written</h4>
          </div>
          
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>You haven't written any reviews yet</p>
            <p className="text-sm">Share your experience with vendors you've worked with</p>
          </div>
        </div>
      </div>

      {/* Complete Profile Card */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">Complete your profile</h4>
          <p className="text-gray-600 text-sm mb-6">
            Your profile helps vendors understand your preferences and provide better service recommendations.
          </p>
          <button 
            onClick={() => alert("Profile completion coming soon!")}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Get started
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">Your activity</h4>
          <div className="space-y-4">
            <StatItem label="Completed bookings" value={user.stats.completedBookings} />
            <StatItem label="Upcoming bookings" value={user.stats.upcomingBookings} />
            <StatItem label="Saved vendors" value={user.stats.favorites} />
            <StatItem label="Reviews written" value={user.stats.reviewsWritten} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Bookings Panel
const BookingsPanel = ({ bookings }) => (
  <div data-aos="fade-up" className="max-w-6xl">
    <h2 className="text-3xl font-semibold mb-8">My bookings</h2>
    
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex gap-2">
          {["All", "Upcoming", "Completed", "Cancelled"].map((filter) => (
            <button key={filter} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      <div className="divide-y">
        {bookings.map((booking, idx) => (
          <div key={booking.id} className="p-6 hover:bg-gray-50" data-aos="fade-up" data-aos-delay={idx * 100}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{booking.title}</h3>
                <p className="text-gray-600">{booking.vendor}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{booking.location}</span>
                  <span>•</span>
                  <span>{booking.bookingNumber}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">₹{booking.amount.toLocaleString()}</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === "upcoming" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Favorites Panel
const FavoritesPanel = ({ favorites }) => (
  <div data-aos="fade-up" className="max-w-6xl">
    <h2 className="text-3xl font-semibold mb-8">Saved vendors</h2>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((vendor, idx) => (
        <div key={vendor.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow" data-aos="fade-up" data-aos-delay={idx * 100}>
          <img src={vendor.image} alt={vendor.title} className="w-full h-48 object-cover" />
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-2">{vendor.title}</h3>
            <p className="text-gray-600 text-sm capitalize mb-4">{vendor.category}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{vendor.rating}</span>
                <span className="text-gray-500 text-sm">({vendor.reviews})</span>
              </div>
              <div className="font-semibold">₹{vendor.price.toLocaleString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Reviews Panel
const ReviewsPanel = () => (
  <div data-aos="fade-up" className="max-w-4xl">
    <h2 className="text-3xl font-semibold mb-8">My reviews</h2>
    <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
      <p className="text-gray-600 mb-6">Share your experience with vendors to help other customers</p>
      <button className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800">
        Write your first review
      </button>
    </div>
  </div>
);

// Settings Panel
const SettingsPanel = ({ user }) => (
  <div data-aos="fade-up" className="max-w-4xl">
    <h2 className="text-3xl font-semibold mb-8">Account settings</h2>
    
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Personal information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Name</span>
            <span className="text-gray-600">{user.profile.firstName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Email</span> 
            <span className="text-gray-600">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Phone</span>
            <span className="text-gray-600">{user.phone}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <div className="space-y-4">
          <ToggleSwitch label="Email notifications" defaultChecked={true} />
          <ToggleSwitch label="SMS notifications" defaultChecked={false} />
          <ToggleSwitch label="Push notifications" defaultChecked={true} />
        </div>
      </div>
    </div>
  </div>
);

// Helper Components
const StatItem = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const ToggleSwitch = ({ label, defaultChecked }) => (
  <div className="flex justify-between items-center">
    <span>{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
    </label>
  </div>
);

const EditModal = ({ user, onClose, onSave }) => {
  const [firstName, setFirstName] = useState(user.profile.firstName);
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md" data-aos="zoom-in">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Edit profile</h3>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">First name</label>
            <input 
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
        <div className="p-6 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button 
            onClick={() => onSave({ firstName })}
            className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;
