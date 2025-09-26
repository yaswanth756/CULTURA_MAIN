/* routes/listing.routes.js */
import express from 'express';
import { getListings ,getListingById,incrementListingViews} from '../../controllers/users/listing.controller.js';

const router = express.Router();

// Single route to handle all filtering, search, pagination
router.get('/', getListings);
router.get('/:id', getListingById);
router.patch('/:listingId/views', incrementListingViews);
export default router;
