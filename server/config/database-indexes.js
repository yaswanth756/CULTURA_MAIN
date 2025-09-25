// Database indexes for production performance
import mongoose from 'mongoose';

export const createIndexes = async () => {
  try {
    // User model indexes
    await mongoose.connection.db.collection('users').createIndex({
      'profile.businessName': 'text',
      'profile.firstName': 'text'
    });
    
    await mongoose.connection.db.collection('users').createIndex({
      'profile.businessName': 1
    });
    
    await mongoose.connection.db.collection('users').createIndex({
      'profile.firstName': 1
    });

    // Listing model indexes
    await mongoose.connection.db.collection('listings').createIndex({
      title: 'text',
      description: 'text',
      features: 'text',
      tags: 'text'
    });
    
    await mongoose.connection.db.collection('listings').createIndex({
      category: 1,
      status: 1,
      'price.base': 1
    });
    
    await mongoose.connection.db.collection('listings').createIndex({
      vendorId: 1,
      status: 1
    });
    
    await mongoose.connection.db.collection('listings').createIndex({
      serviceAreas: 1
    });

    // Booking model indexes
    await mongoose.connection.db.collection('bookings').createIndex({
      vendorId: 1,
      createdAt: 1
    });
    
    await mongoose.connection.db.collection('bookings').createIndex({
      customerId: 1,
      status: 1
    });
    
    await mongoose.connection.db.collection('bookings').createIndex({
      listingId: 1,
      status: 1
    });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};
