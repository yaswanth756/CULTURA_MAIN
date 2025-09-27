// Database indexes for production performance
import mongoose from 'mongoose';

export const createIndexes = async () => {
  try {
    console.log('🔧 Creating database indexes for performance...');

    // Helper function to safely create index
    const safeCreateIndex = async (collection, indexSpec, options = {}) => {
      try {
        await mongoose.connection.db.collection(collection).createIndex(indexSpec, options);
        console.log(`✅ Created index on ${collection}:`, Object.keys(indexSpec).join(', '));
      } catch (error) {
        if (error.code === 85) { // IndexOptionsConflict
          console.log(`ℹ️  Index already exists on ${collection}:`, Object.keys(indexSpec).join(', '));
        } else {
          console.warn(`⚠️  Could not create index on ${collection}:`, error.message);
        }
      }
    };

    // User model indexes
    await safeCreateIndex('users', {
      'profile.firstName': 1
    });

    await safeCreateIndex('users', {
      'profile.businessName': 1
    });

    // 🔥 NEW: User favorites index (for getuserfavoritesProfile)
    await safeCreateIndex('users', {
      favorites: 1
    });

    // Listing model indexes - Skip conflicting text index
    await safeCreateIndex('listings', {
      category: 1,
      status: 1,
      'price.base': 1
    });
    
    await safeCreateIndex('listings', {
      vendorId: 1,
      status: 1
    });
    
    await safeCreateIndex('listings', {
      serviceAreas: 1
    });

    // 🔥 NEW: Rating and creation date indexes
    await safeCreateIndex('listings', {
      'ratings.average': -1,
      createdAt: -1
    });

    // Booking model indexes
    await safeCreateIndex('bookings', {
      vendorId: 1,
      createdAt: -1
    });
    
    // 🔥 ENHANCED: Compound index for user bookings with status
    await safeCreateIndex('bookings', {
      customerId: 1,
      status: 1,
      createdAt: -1
    });
    
    await safeCreateIndex('bookings', {
      listingId: 1,
      status: 1
    });

    // 🔥 NEW: Service date index for upcoming bookings
    await safeCreateIndex('bookings', {
      serviceDate: 1,
      status: 1
    });

    // 🔥 NEW: Review model indexes
    await safeCreateIndex('reviews', {
      listingId: 1,
      status: 1,
      createdAt: -1
    });
    
    await safeCreateIndex('reviews', {
      vendorId: 1,
      status: 1
    });

    await safeCreateIndex('reviews', {
      customerId: 1,
      createdAt: -1
    });

    console.log('✅ Database indexing completed successfully');
    
  } catch (error) {
    console.error('❌ Error in index creation process:', error);
  }
};

// 🔥 NEW: Function to list existing indexes
export const listExistingIndexes = async () => {
  try {
    const collections = ['users', 'listings', 'bookings', 'reviews'];
    
    console.log('\n📋 Current Database Indexes:');
    for (const collectionName of collections) {
      try {
        const indexes = await mongoose.connection.db.collection(collectionName).listIndexes().toArray();
        console.log(`\n${collectionName.toUpperCase()}:`);
        indexes.forEach(index => {
          const keys = Object.keys(index.key).map(k => `${k}:${index.key[k]}`).join(', ');
          console.log(`  • ${index.name}: {${keys}}`);
        });
      } catch (e) {
        console.log(`  ℹ️  Collection ${collectionName} not found`);
      }
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Error listing indexes:', error);
  }
};

// 🔥 NEW: Function to drop and recreate problematic indexes
export const resetIndexes = async () => {
  try {
    console.log('🔄 Resetting problematic indexes...');
    
    // Drop the conflicting text index
    try {
      await mongoose.connection.db.collection('listings').dropIndex('listing_comprehensive_text_search');
      console.log('✅ Dropped conflicting text index');
    } catch (e) {
      console.log('ℹ️  Text index not found or already dropped');
    }
    
    // Recreate with new name
    await mongoose.connection.db.collection('listings').createIndex({
      title: 'text',
      description: 'text',
      features: 'text',
      tags: 'text'
    }, {
      name: 'listing_text_search_v2' // Different name
    });
    
    console.log('✅ Recreated text search index');
    
  } catch (error) {
    console.error('❌ Error resetting indexes:', error);
  }
};
