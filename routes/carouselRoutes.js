import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/auth.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';
import CarouselSlide from '../models/CarouselSlide.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'carousel-slides',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto:good' }]
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// @route   GET /api/carousel/slides
// @desc    Get all carousel slides
// @access  Public
// @route   GET /api/carousel/slides
// @desc    Get active carousel slides (for public display)
// @access  Public
router.get('/slides', async (req, res) => {
    try {
        const slides = await CarouselSlide.find()
            .sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            slides
        });
    } catch (error) {
        console.error('Error fetching carousel slides:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch carousel slides',
            error: error.message
        });
    }
});

// @route   GET /api/carousel/slides/all
// @desc    Get all carousel slides (including inactive, for admin)
// @access  Private/Admin
router.get('/slides/all', protect, admin, async (req, res) => {
    try {
        const slides = await CarouselSlide.find()
            .sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            slides
        });
    } catch (error) {
        console.error('Error fetching all carousel slides:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch carousel slides',
            error: error.message
        });
    }
});

// @route   POST /api/carousel/slides
// @desc    Create a new carousel slide
// @access  Private/Admin
router.post('/slides', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, subtitle, order } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        // Get the highest order number and increment
        const highestOrder = await CarouselSlide.findOne().sort({ order: -1 });
        const newOrder = order || (highestOrder ? highestOrder.order + 1 : 0);

        const slide = await CarouselSlide.create({
            title,
            subtitle,
            image: req.file.path, // Cloudinary URL
            order: newOrder,
            isActive: true
        });

        res.status(201).json({
            success: true,
            slide
        });
    } catch (error) {
        console.error('Error creating carousel slide:', error);

        // If there's an error and image was uploaded, delete it from Cloudinary
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (deleteError) {
                console.error('Error deleting uploaded image:', deleteError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create carousel slide',
            error: error.message
        });
    }
});

// @route   PUT /api/carousel/slides/:id
// @desc    Update a carousel slide
// @access  Private/Admin
router.put('/slides/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, subtitle, order } = req.body;

        let slide = await CarouselSlide.findById(req.params.id);

        if (!slide) {
            return res.status(404).json({
                success: false,
                message: 'Carousel slide not found'
            });
        }

        const oldImageUrl = slide.image;

        // Update fields
        slide.title = title || slide.title;
        slide.subtitle = subtitle || slide.subtitle;
        slide.order = order !== undefined ? order : slide.order;

        // If new image is uploaded, update image and delete old one from Cloudinary
        if (req.file) {
            slide.image = req.file.path;

            // Extract public_id from old Cloudinary URL and delete
            if (oldImageUrl) {
                try {
                    const urlParts = oldImageUrl.split('/');
                    const publicIdWithExt = urlParts[urlParts.length - 1];
                    const publicId = `carousel-slides/${publicIdWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteError) {
                    console.error('Error deleting old image:', deleteError);
                }
            }
        }

        await slide.save();

        res.json({
            success: true,
            slide
        });
    } catch (error) {
        console.error('Error updating carousel slide:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update carousel slide',
            error: error.message
        });
    }
});

// @route   DELETE /api/carousel/slides/:id
// @desc    Delete a carousel slide
// @access  Private/Admin
router.delete('/slides/:id', protect, admin, async (req, res) => {
    try {
        const slide = await CarouselSlide.findById(req.params.id);

        if (!slide) {
            return res.status(404).json({
                success: false,
                message: 'Carousel slide not found'
            });
        }

        // Delete image from Cloudinary
        if (slide.image) {
            try {
                const urlParts = slide.image.split('/');
                const publicIdWithExt = urlParts[urlParts.length - 1];
                const publicId = `carousel-slides/${publicIdWithExt.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error('Error deleting image from Cloudinary:', deleteError);
            }
        }

        await slide.deleteOne();

        res.json({
            success: true,
            message: 'Carousel slide deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting carousel slide:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete carousel slide',
            error: error.message
        });
    }
});

// @route   PATCH /api/carousel/slides/:id/toggle
// @desc    Toggle slide active status
// @access  Private/Admin
router.patch('/slides/:id/toggle', protect, admin, async (req, res) => {
    try {
        const slide = await CarouselSlide.findById(req.params.id);

        if (!slide) {
            return res.status(404).json({
                success: false,
                message: 'Carousel slide not found'
            });
        }

        slide.isActive = !slide.isActive;
        await slide.save();

        res.json({
            success: true,
            slide
        });
    } catch (error) {
        console.error('Error toggling slide status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle slide status',
            error: error.message
        });
    }
});

// @route   PUT /api/carousel/slides/reorder
// @desc    Reorder carousel slides
// @access  Private/Admin
router.put('/slides/reorder', protect, admin, async (req, res) => {
    try {
        const { slides } = req.body; // Array of { id, order }

        if (!Array.isArray(slides)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request format'
            });
        }

        // Update order for each slide
        const updatePromises = slides.map(({ id, order }) =>
            CarouselSlide.findByIdAndUpdate(id, { order }, { new: true })
        );

        await Promise.all(updatePromises);

        const updatedSlides = await CarouselSlide.find().sort({ order: 1 });

        res.json({
            success: true,
            slides: updatedSlides
        });
    } catch (error) {
        console.error('Error reordering slides:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reorder slides',
            error: error.message
        });
    }
});

export default router;