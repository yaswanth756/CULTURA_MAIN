export const generateVendorDataByCategory = () => {
    const states = ["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra"];
    const cities = {
      "Andhra Pradesh": ["Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur", "Kurnool"],
      "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
      "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"]
    };
    const vendorsByCategory = {};
    const serviceCategories = ["venues", "catering", "cakes", "decorations", "photography", "videography", "music", "makeup", "mandap", "hosts"];
    serviceCategories.forEach((service, serviceIndex) => {
      vendorsByCategory[service] = [];
      const vendorCount = 12 + Math.floor(Math.random() * 4);
      for (let i = 0; i < vendorCount; i++) {
        const state = states[Math.floor(Math.random() * states.length)];
        const cityList = cities[state];
        const city = cityList[Math.floor(Math.random() * cityList.length)];
        vendorsByCategory[service].push({
          id: `${service}_${i + 1}`,
          name: `${service.charAt(0).toUpperCase() + service.slice(1)} Pro ${i + 1}`,
          description: `Professional ${service} service provider with years of experience and excellent customer reviews`,
          location: `${city}, ${state}`,
          state: state,
          city: city,
          service: service,
          price: Math.floor(Math.random() * 50000) + 5000,
          rating: (Math.random() * 2 + 3).toFixed(1),
          reviews: Math.floor(Math.random() * 200) + 10,
          image: `https://picsum.photos/400/300?random=${serviceIndex * 100 + i}`,
          featured: Math.random() > 0.8,
        });
      }
    });
    return vendorsByCategory;
  };