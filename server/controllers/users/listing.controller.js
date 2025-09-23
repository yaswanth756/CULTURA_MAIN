/* controllers/listing.controller.js */
import Listing from '../../models/Listing.js';
import User from '../../models/User.js';
import mongoose from "mongoose"

export const getListings = async (req, res) => {
  try {
    const {
      q: search,         // search query (from ?q=)
      category = 'all',
      location,
      vendor,
      priceMin,
      priceMax,
      rating,
      page = 1,
      limit = 12,
      sortBy = 'newest'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };
    
    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Location filter
    if (location) {
      filter.serviceAreas = { $regex: location, $options: 'i' };
    }
    
    // Vendor name search
    if (vendor) {
      const vendorUsers = await User.find({
        $or: [
          { 'profile.businessName': { $regex: vendor, $options: 'i' } },
          { 'profile.firstName': { $regex: vendor, $options: 'i' } }
        ]
      }).select('_id');
      
      if (vendorUsers.length > 0) {
        filter.vendorId = { $in: vendorUsers.map(v => v._id) };
      }
    }
    
    // Price range filter
    if (priceMin || priceMax) {
      filter['price.base'] = {};
      if (priceMin) filter['price.base'].$gte = parseInt(priceMin);
      if (priceMax) filter['price.base'].$lte = parseInt(priceMax);
    }
    
    // Rating filter
    if (rating) {
      filter['ratings.average'] = { $gte: parseFloat(rating) };
    }
    
    // Text search
    // In controllers/listing.controller.js - UPDATE THIS SECTION:
    if (search && search.trim()) {
      filter.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
          { features: { $elemMatch: { $regex: search.trim(), $options: 'i' } } }, // ✅ ADD THIS LINE
          { tags: { $regex: search.trim(), $options: 'i' } },
          { serviceAreas: { $elemMatch: { $regex: search.trim(), $options: 'i' } } },
          { subcategory: { $regex: search.trim(), $options: 'i' } }
      ];
    }
  

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sortBy === 'price_low') sortOption = { 'price.base': 1 };
    else if (sortBy === 'price_high') sortOption = { 'price.base': -1 };
    else if (sortBy === 'rating') sortOption = { 'ratings.average': -1 };

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const [listings, totalCount] = await Promise.all([
      Listing.find(filter)
        .populate('vendorId', 'profile.firstName profile.businessName profile.avatar vendorInfo.verified')
        .select('title description category price images serviceAreas tags ratings createdAt')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      
      Listing.countDocuments(filter)
    ]);

    // Format response
    const formattedListings = listings.map(listing => ({
      _id: listing._id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      price: listing.price,
      images: listing.images,
      serviceAreas: listing.serviceAreas,
      tags: listing.tags,
      ratings: listing.ratings,
      createdAt: listing.createdAt,
      vendorName: listing.vendorId?.profile?.businessName || listing.vendorId?.profile?.firstName || 'Unknown',
      vendorVerified: listing.vendorId?.vendorInfo?.verified || false,
      formattedPrice: `₹${listing.price.base.toLocaleString('en-IN')}`
    }));

    return res.json({
      success: true,
      data: formattedListings,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Get Listings Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch listings'
    });
  }
};

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format'
      });
    }

    // Find listing and populate vendor info
    const listing = await Listing.findById(id)
      .populate({
        path: 'vendorId',
        select: 'profile vendorInfo phone email',
        match: { status: 'active' }
      })
      .lean();

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Listing is not available'
      });
    }

    res.status(200).json(listing);

  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing details'
    });
  }
};