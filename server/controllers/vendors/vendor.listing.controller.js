import Listing from "../../models/Listing.js";


// Create new listing
export const createListing = async (req, res) => {
  try {
    const vendorId = req.user._id; // From auth middleware
    
    const {
      title,
      description,
      category,
      subcategory,
      price,
      images,
      serviceAreas,
      features,
      tags
    } = req.body;

    // Validation
    if (!title?.trim() || !description?.trim() || !category || !subcategory?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and subcategory are required'
      });
    }

    if (!price?.base || price.base <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    // Create listing
    const listing = new Listing({
      vendorId,
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory.trim(),
      price: {
        base: Number(price.base),
        type: price.type || 'per_event',
        currency: price.currency || 'INR'
      },
      images: images || [],
      serviceAreas: serviceAreas || [],
      features: features || [],
      tags: tags || [],
      status: 'active'
    });

    await listing.save();

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });

  } catch (error) {
    console.error('Create listing error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create listing'
    });
  }
};

// Get vendor's listings
export const getVendorListings = async (req, res) => {
  try {
    const vendorId = req.user._id;
    console.log(vendorId);  
    
    const listings = await Listing.find({ vendorId })
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({
      success: true,
      data: listings
    });

  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings'
    });
  }
};


// controllers/listingController.js

// Update listing
export const updateListing = async (req, res) => {
    try {
      const vendorId = req.user._id;
      const { id } = req.params;
      
      const {
        title,
        description,
        category,
        subcategory,
        price,
        images,
        serviceAreas,
        features,
        tags
      } = req.body;
  
      // Find listing and verify ownership
      const listing = await Listing.findOne({ _id: id, vendorId });
      
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found or you do not have permission to edit it'
        });
      }
  
      // Validation
      if (!title?.trim() || !description?.trim() || !category || !subcategory?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, category, and subcategory are required'
        });
      }
  
      if (!price?.base || price.base <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid price is required'
        });
      }
  
      // Update listing fields
      listing.title = title.trim();
      listing.description = description.trim();
      listing.category = category;
      listing.subcategory = subcategory.trim();
      listing.price = {
        base: Number(price.base),
        type: price.type || 'per_event',
        currency: price.currency || 'INR'
      };
      listing.images = images || [];
      listing.serviceAreas = serviceAreas || [];
      listing.features = features || [];
      listing.tags = tags || [];
  
      await listing.save();
  
      res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        data: listing
      });
  
    } catch (error) {
      console.error('Update listing error:', error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(', ')
        });
      }
  
      res.status(500).json({
        success: false,
        message: 'Failed to update listing'
      });
    }
  };
  
  // Delete listing
export const deleteListing = async (req, res) => {
    try {
      const vendorId = req.user._id;
      const { id } = req.params;
  
      // Find and delete listing (verify ownership)
      const listing = await Listing.findOneAndDelete({ _id: id, vendorId });
      
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found or you do not have permission to delete it'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Listing deleted successfully',
        data: { _id: id }
      });
  
    } catch (error) {
      console.error('Delete listing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete listing'
      });
    }
  };


  export const toggleListingStatus = async (req, res) => {
    try {
      const vendorId = req.user._id;
      const { id } = req.params;
  
      // Find listing and verify ownership
      const listing = await Listing.findOne({ _id: id, vendorId });
      
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found or you do not have permission to modify it'
        });
      }
  
      // Toggle status
      listing.status = listing.status === 'active' ? 'inactive' : 'active';
      await listing.save();
  
      res.status(200).json({
        success: true,
        message: `Listing ${listing.status === 'active' ? 'activated' : 'deactivated'} successfully`,
        data: listing
      });
  
    } catch (error) {
      console.error('Toggle listing status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update listing status'
      });
    }
  };
  