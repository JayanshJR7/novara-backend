import mongoose from 'mongoose';

const carouselSlideSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    subtitle: {
        type: String,
        required: [true, 'Please add a subtitle'],
        trim: true,
        maxlength: [200, 'Subtitle cannot be more than 200 characters']
    },
    image: {
        type: String,
        required: [true, 'Please add an image']
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for ordering slides
carouselSlideSchema.index({ order: 1, createdAt: -1 });

const CarouselSlide = mongoose.model('CarouselSlide', carouselSlideSchema);
export default CarouselSlide;
