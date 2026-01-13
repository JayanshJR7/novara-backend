import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  verified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null 
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null 
  },
  adminResponse: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

reviewSchema.index({ isApproved: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
