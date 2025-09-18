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
          avatar: 'https://example.com/avatars/ramesh.jpg'
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
          avatar: 'https://example.com/avatars/lakshmi.jpg'
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
          avatar: 'https://example.com/avatars/krishna.jpg'
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
          avatar: 'https://example.com/avatars/priya.jpg'
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
          avatar: 'https://example.com/avatars/venkat.jpg'
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
          avatar: 'https://example.com/avatars/sita.jpg'
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
          avatar: 'https://example.com/avatars/ravi.jpg'
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
          avatar: 'https://example.com/avatars/meera.jpg'
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
          avatar: 'https://example.com/avatars/suresh.jpg'
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
          avatar: 'https://example.com/avatars/anjali.jpg'
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

    // Sample listings data corresponding to vendors
    const sampleListings = [
        {
          vendorId: createdVendors[0]._id, // Ramesh Catering
          title: 'Traditional South Indian Wedding Catering',
          description: 'Authentic Telugu cuisine with variety of traditional dishes. Serves up to 1000 guests with experienced chefs and quality ingredients. Specializes in wedding feasts with customizable menus.',
          category: 'catering',
          subcategory: 'Wedding Catering',
          price: { base: 350, type: 'per_person', currency: 'INR' },
          images: [
            'https://plus.unsplash.com/premium_photo-1681830320344-6e7a2a8726c3?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZXZlbnQlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D',
            'https://images.unsplash.com/photo-1601050696436-8df9b47c4f02?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Tirupati', 'Chittoor', 'Kadapa'],
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
            'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXZlbnQlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D',
            'https://images.unsplash.com/photo-1497807576460-89d7f03b6091?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Chittoor', 'Tirupati', 'Vellore'],
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
            'https://plus.unsplash.com/premium_photo-1729163257698-46e2d17d7b45?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fGV2ZW50JTIwaW1hZ2VzfGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1572373674298-f5f1190aefc4?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Tirupati', 'Chittoor'],
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
            'https://plus.unsplash.com/premium_photo-1672642064354-9fda98878976?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGV2ZW50JTIwaW1hZ2VzfGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1629655391376-52f25281f4a2?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Kadapa', 'Tirupati', 'Kurnool'],
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
            'https://plus.unsplash.com/premium_photo-1681409178587-381f10eff3af?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fGV2ZW50JTIwaW1hZ2VzfGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Nellore', 'Tirupati', 'Ongole'],
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
            'https://plus.unsplash.com/premium_photo-1681409178587-381f10eff3af?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fGV2ZW50JTIwaW1hZ2VzfGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1618220382210-13f2fc73f541?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Tirupati', 'Chittoor', 'Vellore'],
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
            'https://images.unsplash.com/photo-1596649300028-340ad0ec6146?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fGV2ZW50JTIwaW1hZ2VzfGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Chittoor', 'Tirupati', 'Vellore'],
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
            'https://images.unsplash.com/photo-1596649300028-340ad0ec6146?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fGV2ZW50JTIwaW1hZ2VzfGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1582719478141-6b6f20c89be2?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Tirupati', 'Chittoor', 'Kadapa'],
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
            'https://plus.unsplash.com/premium_photo-1753327853288-c412aea7c08c?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fGV2ZW50JTIwaW1hZ2VzfGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1582719477921-3c8b7c57d3e1?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Kadapa', 'Kurnool', 'Tirupati'],
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
            'https://plus.unsplash.com/premium_photo-1753327853288-c412aea7c08c?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fGV2ZW50JTIwaW1hZ2VzfGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
          ],
          serviceAreas: ['Nellore', 'Tirupati', 'Ongole'],
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
    console.log(result.vendors[0].displayName);
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
//runTestDataGeneration();