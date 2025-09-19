import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

// Sample vendor data generator
const generateVendorTestData = async () => {
  try {
    console.log('🚀 Starting vendor and listing data generation...');
    
    // Check MongoDB connection
    if (!mongoose.connection.readyState) {
      throw new Error('❌ MongoDB not connected! Please connect to database first.');
    }
    
    console.log('✅ MongoDB connection verified');

    // Sample vendor users data
    const vendorUsers = [
      {
        email: 'ramesh.catering@gmail.com',
        phone: '+91-9876543210',
        role: 'vendor',
        profile: {
          firstName: 'Ramesh',
          businessName: 'Ramesh Royal Catering',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Tirupati',
          address: 'Shop No 15, Gandhi Road, Tirupati, AP 517501',
          coordinates: [79.4192, 13.6288]
        },
        vendorInfo: {
          verified: true,
          rating: 4.5,
          reviewCount: 45
        },
        status: 'active'
      },
      {
        email: 'lakshmi.photos@yahoo.com',
        phone: '+91-9876543211',
        role: 'vendor',
        profile: {
          firstName: 'Lakshmi',
          businessName: 'Lakshmi Photography Studio',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332029c?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Chittoor',
          address: '23, MG Road, Chittoor, AP 517001',
          coordinates: [79.1003, 13.2172]
        },
        vendorInfo: {
          verified: true,
          rating: 4.8,
          reviewCount: 67
        },
        status: 'active'
      },
      {
        email: 'krishna.venues@outlook.com',
        phone: '+91-9876543212',
        role: 'vendor',
        profile: {
          firstName: 'Krishna',
          businessName: 'Krishna Palace Venues',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Tirupati',
          address: 'Near Alipiri, Tirupati, AP 517507',
          coordinates: [79.3470, 13.6839]
        },
        vendorInfo: {
          verified: true,
          rating: 4.2,
          reviewCount: 23
        },
        status: 'active'
      },
      {
        email: 'priya.makeup@gmail.com',
        phone: '+91-9876543213',
        role: 'vendor',
        profile: {
          firstName: 'Priya',
          businessName: 'Priya Beauty Studio',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Kadapa',
          address: '45, Bypass Road, Kadapa, AP 516001',
          coordinates: [78.8242, 14.4673]
        },
        vendorInfo: {
          verified: false,
          rating: 4.6,
          reviewCount: 34
        },
        status: 'active'
      },
      {
        email: 'venkat.music@hotmail.com',
        phone: '+91-9876543214',
        role: 'vendor',
        profile: {
          firstName: 'Venkat',
          businessName: 'Venkat Music & DJ Services',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Nellore',
          address: '12, Clock Tower Road, Nellore, AP 524001',
          coordinates: [79.9864, 14.4426]
        },
        vendorInfo: {
          verified: true,
          rating: 4.3,
          reviewCount: 28
        },
        status: 'active'
      },
      {
        email: 'sita.decorations@gmail.com',
        phone: '+91-9876543215',
        role: 'vendor',
        profile: {
          firstName: 'Sita',
          businessName: 'Sita Flower Decorations',
          avatar: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Tirupati',
          address: 'Renigunta Road, Tirupati, AP 517506',
          coordinates: [79.3129, 13.6692]
        },
        vendorInfo: {
          verified: true,
          rating: 4.7,
          reviewCount: 52
        },
        status: 'active'
      },
      {
        email: 'ravi.cakes@yahoo.in',
        phone: '+91-9876543216',
        role: 'vendor',
        profile: {
          firstName: 'Ravi',
          businessName: 'Ravi Sweet Cakes',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Chittoor',
          address: 'Market Street, Chittoor, AP 517002',
          coordinates: [79.1030, 13.2166]
        },
        vendorInfo: {
          verified: true,
          rating: 4.4,
          reviewCount: 41
        },
        status: 'active'
      },
      {
        email: 'meera.video@gmail.com',
        phone: '+91-9876543217',
        role: 'vendor',
        profile: {
          firstName: 'Meera',
          businessName: 'Meera Cinematic Videos',
          avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Tirupati',
          address: 'Air Bypass Road, Tirupati, AP 517520',
          coordinates: [79.4050, 13.6500]
        },
        vendorInfo: {
          verified: true,
          rating: 4.9,
          reviewCount: 78
        },
        status: 'active'
      },
      {
        email: 'suresh.mandap@outlook.com',
        phone: '+91-9876543218',
        role: 'vendor',
        profile: {
          firstName: 'Suresh',
          businessName: 'Suresh Traditional Mandaps',
          avatar: 'https://images.unsplash.com/photo-1519744346361-7a029b427a59?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Kadapa',
          address: 'Railway Station Road, Kadapa, AP 516003',
          coordinates: [78.8200, 14.4650]
        },
        vendorInfo: {
          verified: true,
          rating: 4.1,
          reviewCount: 19
        },
        status: 'active'
      },
      {
        email: 'anjali.hosts@gmail.com',
        phone: '+91-9876543219',
        role: 'vendor',
        profile: {
          firstName: 'Anjali',
          businessName: 'Anjali Event Hosts',
          avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face'
        },
        location: {
          city: 'Nellore',
          address: 'Gandhi Nagar, Nellore, AP 524004',
          coordinates: [79.9800, 14.4400]
        },
        vendorInfo: {
          verified: false,
          rating: 4.0,
          reviewCount: 15
        },
        status: 'active'
      }
    ];

    // Insert vendor users (one by one to avoid timeout)
    console.log('📝 Creating vendor users...');
    const createdVendors = [];
    
    for (let i = 0; i < vendorUsers.length; i++) {
      try {
        const vendor = new User(vendorUsers[i]);
        const savedVendor = await vendor.save();
        createdVendors.push(savedVendor);
        console.log(`✅ Created vendor ${i + 1}/10: ${savedVendor.profile.businessName}`);
      } catch (err) {
        console.log(`⚠️ Skipping vendor ${i + 1} (might already exist): ${vendorUsers[i].profile.businessName}`);
        // Try to find existing vendor
        const existing = await User.findOne({ email: vendorUsers[i].email });
        if (existing) createdVendors.push(existing);
      }
    }
    
    console.log(`✅ Total vendors ready: ${createdVendors.length}`);

    // ✅ UPDATED: Sample listings data with real images and features
    const sampleListings = [
      {
        vendorId: createdVendors[0]._id, // Ramesh Catering
        title: 'Traditional South Indian Wedding Catering',
        description: 'Authentic Telugu cuisine with variety of traditional dishes. Serves up to 1000 guests with experienced chefs and quality ingredients. Specializes in wedding feasts with customizable menus.',
        category: 'catering',
        subcategory: 'Wedding Catering',
        price: { base: 350, type: 'per_person', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Tirupati', 'Chittoor', 'Kadapa'],
        features: [
          'Live Cooking Stations',
          'Traditional Banana Leaf Service',
          'Multi-Cuisine Options',
          'Experienced Chefs',
          'Hygiene Certified Kitchen',
          'Custom Menu Planning'
        ],
        tags: ['traditional', 'south indian', 'wedding', 'vegetarian', 'non-vegetarian'],
        ratings: { average: 4.5, count: 45 },
        status: 'active'
      },
      {
        vendorId: createdVendors[1]._id, // Lakshmi Photography
        title: 'Professional Wedding Photography & Candid Shots',
        description: 'Capture your special moments with professional photography services. Includes pre-wedding, wedding day, and reception photography with high-resolution images and custom albums.',
        category: 'photography',
        subcategory: 'Wedding Photography',
        price: { base: 25000, type: 'per_event', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Chittoor', 'Tirupati', 'Vellore'],
        features: [
          'High Resolution Photos',
          'Candid Photography',
          'Pre-Wedding Shoot',
          'Digital Albums',
          'Photo Editing',
          'Quick Delivery'
        ],
        tags: ['candid', 'traditional', 'pre-wedding', 'portraits', 'albums'],
        ratings: { average: 4.8, count: 67 },
        status: 'active'
      },
      {
        vendorId: createdVendors[2]._id, // Krishna Venues
        title: 'Spacious Wedding Hall with AC and Parking',
        description: 'Beautiful air-conditioned wedding hall accommodating 500+ guests. Includes stage decoration, sound system, parking facility, and catering area. Perfect for weddings and receptions.',
        category: 'venues',
        subcategory: 'Wedding Halls',
        price: { base: 45000, type: 'per_event', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f29da8c89f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Tirupati', 'Chittoor'],
        features: [
          'AC Hall (500+ Capacity)',
          'Free Parking',
          'Stage Setup',
          'Sound System',
          'Catering Area',
          'Bridal Room'
        ],
        tags: ['ac hall', 'parking', 'stage', 'sound system', '500 capacity'],
        ratings: { average: 4.2, count: 23 },
        status: 'active'
      },
      {
        vendorId: createdVendors[3]._id, // Priya Makeup
        title: 'Bridal Makeup & Hair Styling Services',
        description: 'Professional bridal makeup artist specializing in traditional and contemporary looks. Includes trial session, bridal makeup, hair styling, and touch-up services throughout the event.',
        category: 'makeup',
        subcategory: 'Bridal Makeup',
        price: { base: 8000, type: 'per_person', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1522337360788-dee21abb3848?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Kadapa', 'Tirupati', 'Kurnool'],
        features: [
          'HD Makeup',
          'Hair Styling',
          'Trial Session',
          'Touch-up Service',
          'Premium Products',
          'Traditional & Modern Looks'
        ],
        tags: ['bridal', 'hair styling', 'trial session', 'traditional', 'contemporary'],
        ratings: { average: 4.6, count: 34 },
        status: 'active'
      },
      {
        vendorId: createdVendors[4]._id, // Venkat Music
        title: 'DJ Services & Live Music for Weddings',
        description: 'Complete music entertainment with DJ services, sound system, and live band options. Includes wedding songs, dance music, and announcements with professional equipment.',
        category: 'music',
        subcategory: 'DJ & Live Music',
        price: { base: 15000, type: 'per_event', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1571974599782-87624638275c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Nellore', 'Tirupati', 'Ongole'],
        features: [
          'Professional DJ Setup',
          'Live Band Option',
          'Sound System',
          'Wireless Microphones',
          'Dance Floor Lighting',
          'Music Library'
        ],
        tags: ['dj', 'live music', 'dance', 'sound system', 'announcements'],
        ratings: { average: 4.3, count: 28 },
        status: 'active'
      },
      {
        vendorId: createdVendors[5]._id, // Sita Decorations
        title: 'Traditional Flower Decorations & Stage Setup',
        description: 'Beautiful flower decorations for weddings including stage decoration, entrance arch, car decoration, and venue decoration with fresh flowers and traditional designs.',
        category: 'decorations',
        subcategory: 'Flower Decorations',
        price: { base: 12000, type: 'per_event', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f29da8c89f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Tirupati', 'Chittoor', 'Vellore'],
        features: [
          'Fresh Flower Decorations',
          'Stage Backdrop',
          'Entrance Arch',
          'Car Decoration',
          'Table Centerpieces',
          'Traditional Designs'
        ],
        tags: ['flowers', 'stage decoration', 'entrance arch', 'car decoration', 'traditional'],
        ratings: { average: 4.7, count: 52 },
        status: 'active'
      },
      {
        vendorId: createdVendors[6]._id, // Ravi Cakes
        title: 'Custom Wedding Cakes & Sweet Boxes',
        description: 'Delicious custom wedding cakes and traditional sweet boxes. Multi-tier cakes with custom designs, flavors, and decorations. Also provides traditional sweets and dessert tables.',
        category: 'cakes',
        subcategory: 'Wedding Cakes',
        price: { base: 2500, type: 'fixed', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Chittoor', 'Tirupati', 'Vellore'],
        features: [
          'Custom Cake Design',
          'Multiple Flavors',
          'Multi-Tier Cakes',
          'Traditional Sweets',
          'Dessert Table Setup',
          'Home Delivery'
        ],
        tags: ['custom cakes', 'multi-tier', 'traditional sweets', 'dessert table', 'wedding'],
        ratings: { average: 4.4, count: 41 },
        status: 'active'
      },
      {
        vendorId: createdVendors[7]._id, // Meera Video
        title: 'Cinematic Wedding Videography',
        description: 'Professional wedding videography with cinematic style filming. Includes pre-wedding videos, ceremony coverage, reception highlights, and edited final video with drone shots.',
        category: 'videography',
        subcategory: 'Wedding Videos',
        price: { base: 35000, type: 'per_event', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Tirupati', 'Chittoor', 'Kadapa'],
        features: [
          '4K Ultra HD Recording',
          'Drone Footage',
          'Same Day Highlights',
          'Professional Editing',
          'Multiple Cameras',
          'Audio Recording'
        ],
        tags: ['cinematic', 'drone shots', 'pre-wedding', 'highlights', 'editing'],
        ratings: { average: 4.9, count: 78 },
        status: 'active'
      },
      {
        vendorId: createdVendors[8]._id, // Suresh Mandap
        title: 'Traditional Wedding Mandap Setup',
        description: 'Beautiful traditional mandap decorations with authentic designs. Includes mandap construction, floral decorations, lighting, and traditional elements for Hindu wedding ceremonies.',
        category: 'mandap',
        subcategory: 'Traditional Mandap',
        price: { base: 18000, type: 'per_event', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f29da8c89f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Kadapa', 'Kurnool', 'Tirupati'],
        features: [
          'Traditional Mandap Construction',
          'Coconut & Banana Decorations',
          'Sacred Fire Setup',
          'Priest Seating Arrangement',
          'Traditional Lighting',
          'Flower Garlands'
        ],
        tags: ['traditional', 'hindu wedding', 'floral', 'lighting', 'authentic'],
        ratings: { average: 4.1, count: 19 },
        status: 'active'
      },
      {
        vendorId: createdVendors[9]._id, // Anjali Hosts
        title: 'Professional Wedding Hosts & Anchors',
        description: 'Experienced wedding hosts and anchors for ceremonies and receptions. Bilingual hosting in Telugu and English with engaging commentary and smooth event coordination.',
        category: 'hosts',
        subcategory: 'Wedding Anchors',
        price: { base: 5000, type: 'per_event', currency: 'INR' },
        images: [
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f29da8c89f?w=800&auto=format&fit=crop&q=80'
        ],
        serviceAreas: ['Nellore', 'Tirupati', 'Ongole'],
        features: [
          'Bilingual Hosting',
          'Event Coordination',
          'Microphone & Sound Setup',
          'Ceremony Guidance',
          'Reception Management',
          'Interactive Activities'
        ],
        tags: ['bilingual', 'telugu', 'english', 'ceremonies', 'coordination'],
        ratings: { average: 4.0, count: 15 },
        status: 'active'
      }
    ];

    // Insert listings (one by one to avoid timeout)
    console.log('📝 Creating listings...');
    const createdListings = [];
    
    for (let i = 0; i < sampleListings.length; i++) {
      try {
        const listing = new Listing(sampleListings[i]);
        const savedListing = await listing.save();
        createdListings.push(savedListing);
        console.log(`✅ Created listing ${i + 1}/10: ${savedListing.title}`);
      } catch (err) {
        console.log(`⚠️ Error creating listing ${i + 1}: ${err.message}`);
      }
    }
    
    console.log(`✅ Total listings created: ${createdListings.length}`);

    console.log('\n🎉 Test data generation completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Vendors: ${createdVendors.length}`);
    console.log(`   - Listings: ${createdListings.length}`);
    
    return {
      vendors: createdVendors,
      listings: createdListings
    };

  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  }
};

// Function to clear test data (useful for cleanup)
const clearTestData = async () => {
  try {
    console.log('🧹 Clearing test data...');
    
    // Delete all vendors and listings (be careful with this in production!)
    const deletedListings = await Listing.deleteMany({ 
      category: { $in: ['venues', 'catering', 'photography', 'videography', 'music', 'makeup', 'decorations', 'cakes', 'mandap', 'hosts'] }
    });
    
    const deletedVendors = await User.deleteMany({ 
      role: 'vendor',
      email: { $regex: /@(gmail|yahoo|outlook|hotmail)\./ }
    });
    
    console.log(`✅ Cleared ${deletedVendors.deletedCount} vendors and ${deletedListings.deletedCount} listings`);
    
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    throw error;
  }
};

// Usage example
const runTestDataGeneration = async () => {
  try {
    // Clear existing test data (optional)
    // await clearTestData();
    
    // Generate new test data
    const result = await generateVendorTestData();
    
    console.log('\n🔍 Sample vendor created:');
    console.log(result.vendors[0].profile.businessName);
    console.log('\n🔍 Sample listing created:');
    console.log(result.listings[0].title);
    
  } catch (error) {
    console.error('Failed to run test data generation:', error);
  }
};

// Export functions
export {
  generateVendorTestData,
  clearTestData,
  runTestDataGeneration
};

// Uncomment to run immediately
// runTestDataGeneration();
