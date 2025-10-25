import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { authenticateVendor } from '../middleware/vendor/vendor.auth.middleware.js'; // Your auth middleware

const router = express.Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files allowed!'), false);
    }
  }
});


// Single image upload endpoint  
router.post('/upload/single',  authenticateVendor, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
  
      const base64String = req.file.buffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64String}`;
      
      // 🔥 ADD TRANSFORMATION HERE 🔥
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: 'listings',
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },    // Smaller files
          { quality: 'auto:good' },                      // Better compression  
          { format: 'auto' }                             // Optimal format (WebP when supported)
        ]
      });
  
      res.json({
        success: true,
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id
      });
  
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed'
      });
    }
  });
  
  // Multiple images upload endpoint
  router.post('/upload/multiple', upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
  
      const uploadPromises = req.files.map(async (file) => {
        const base64String = file.buffer.toString('base64');
        const dataURI = `data:${file.mimetype};base64,${base64String}`;
        
        // 🔥 ADD TRANSFORMATION HERE TOO 🔥
        return cloudinary.uploader.upload(dataURI, {
          folder: 'listings',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },    // Smaller files
            { quality: 'auto:good' },                      // Better compression  
            { format: 'auto' }                             // Optimal format (WebP when supported)
          ]
        });
      });
  
      const uploadResults = await Promise.all(uploadPromises);
      
      const urls = uploadResults.map(result => ({
        url: result.secure_url,
        publicId: result.public_id
      }));
  
      res.json({
        success: true,
        urls: urls
      });
  
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed'
      });
    }
  });
  

export default router;
