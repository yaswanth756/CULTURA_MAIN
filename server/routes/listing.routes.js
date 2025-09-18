/* routes/listing.routes.js */
import express from 'express';
import { getListings } from '../controllers/listing.controller.js';

const router = express.Router();

// Single route to handle all filtering, search, pagination
router.get('/', getListings);

export default router;
