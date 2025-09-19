/* routes/listing.routes.js */
import express from 'express';
import { getListings ,getListingById} from '../controllers/listing.controller.js';

const router = express.Router();

// Single route to handle all filtering, search, pagination
router.get('/', getListings);
router.get('/:id', getListingById);
export default router;
