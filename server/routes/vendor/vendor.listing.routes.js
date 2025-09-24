import { createListing, getVendorListings , updateListing, 
    deleteListing,toggleListingStatus  } from "../../controllers/vendors/vendor.listing.controller.js";
import { authenticateVendor } from "../../middleware/vendor/vendor.auth.middleware.js";
import express from "express";
const router = express.Router();

router.use(authenticateVendor);

router.post('/', createListing);           // POST /api/vendor/listings
router.get('/', getVendorListings);        // GET /api/vendor/listings
router.put('/:id', updateListing);         // PUT /api/vendor/listings/:id
router.delete('/:id', deleteListing);    
router.patch('/:id/status', toggleListingStatus); 
export default router;


// /api/vendor/listings/createlisting