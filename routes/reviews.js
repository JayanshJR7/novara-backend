import express from 'express';
import Review from '../models/Review.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all approved reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      isApproved: true, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .select('-email'); 

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// @route   GET /api/reviews/all (Admin)
// @desc    Get all reviews including unapproved
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// @route   GET /api/reviews/stats
// @desc    Get review statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: { isApproved: true, isActive: true }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          fiveStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] }
          },
          fourStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] }
          },
          threeStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] }
          },
          twoStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] }
          },
          oneStarCount: {
            $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0
      }
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, title, review } = req.body;

    // Validation
    if (!name || !email || !rating || !title || !review) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create review
    const newReview = await Review.create({
      name,
      email,
      rating,
      title,
      review,
      isApproved: false, // Requires admin approval
      verified: false
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will be published after admin approval.',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit review'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review (Admin)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, rating, title, review, isApproved, verified, adminResponse } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        name,
        rating,
        title,
        review,
        isApproved,
        verified,
        adminResponse
      },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// @route   PATCH /api/reviews/:id/approve
// @desc    Approve a review (Admin)
// @access  Private/Admin
router.patch('/:id/approve', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review approved successfully',
      review
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve review'
    });
  }
});

// @route   PATCH /api/reviews/:id/toggle
// @desc    Toggle review active status (Admin)
// @access  Private/Admin
router.patch('/:id/toggle', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isActive = !review.isActive;
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.isActive ? 'activated' : 'deactivated'} successfully`,
      review
    });
  } catch (error) {
    console.error('Error toggling review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle review status'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

export default router;