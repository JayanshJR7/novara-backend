import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: [true, 'Category name must be unique'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showInNavbar: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

CategorySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const Category = mongoose.model('Category', CategorySchema);
export default Category;