import React, { useState } from "react";
import { Star, Heart } from "lucide-react";

// TODO: Replace with API call when backend is ready
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
  },
  {
    id: "fav_3",
    title: "Royal Catering Services", 
    category: "catering",
    rating: 4.8,
    reviews: 234,
    price: 800,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop"
  }
];

const FavoritesPanel = () => {
  const [favorites, setFavorites] = useState(dummyFavorites);

  const handleRemoveFavorite = (favoriteId) => {
    // TODO: Call API to remove from favorites
    setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    alert("Removed from favorites!");
  };

  return (
    <div data-aos="fade-up" className="max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">Saved vendors</h2>
        <p className="text-gray-600">{favorites.length} saved vendor{favorites.length !== 1 ? 's' : ''}</p>
      </div>
      
      {favorites.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((vendor, idx) => (
            <div key={vendor.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow relative" data-aos="fade-up" data-aos-delay={idx * 100}>
              <button 
                onClick={() => handleRemoveFavorite(vendor.id)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                title="Remove from favorites"
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </button>
              <img src={vendor.image} alt={vendor.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">{vendor.title}</h3>
                <p className="text-gray-600 text-sm capitalize mb-4">{vendor.category}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{vendor.rating}</span>
                    <span className="text-gray-500 text-sm">({vendor.reviews})</span>
                  </div>
                  <div className="font-semibold">
                    ₹{vendor.price.toLocaleString()}
                    {vendor.category === "catering" && <span className="text-sm font-normal text-gray-500">/person</span>}
                  </div>
                </div>
                <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-xl hover:bg-gray-800 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">No saved vendors yet</h3>
          <p className="text-gray-600 mb-6">Start exploring and save your favorite vendors for easy access</p>
          <button className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800">
            Browse Vendors
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPanel;
