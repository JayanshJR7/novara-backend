import Category from '../models/Category.js';
import Product from '../models/products.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
    try {
        const { showInNavbar, isActive } = req.query;

        let filter = {};

        if (showInNavbar !== undefined) {
            filter.showInNavbar = showInNavbar === 'true';
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const categories = await Category.find(filter).sort({ displayOrder: 1 });
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({
                    category: category.slug
                });
                return {
                    ...category.toObject(),
                    productCount
                };
            })
        );

        res.json({
            success: true,
            count: categoriesWithCount.length,
            categories: categoriesWithCount
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:identifier
 * @access  Public
 */
export const getCategoryById = async (req, res) => {
    try {
        const { identifier } = req.params;
        let category = await Category.findById(identifier);

        if (!category) {
            category = await Category.findOne({ slug: identifier });
        }

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Get product count
        const productCount = await Product.countDocuments({
            category: category.slug
        });

        res.json({
            success: true,
            category: {
                ...category.toObject(),
                productCount
            }
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res) => {
    try {
        const { name, slug, displayOrder, showInNavbar, description } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if category with same name or slug exists
        const existingCategory = await Category.findOne({
            $or: [
                { name: name.trim() },
                { slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
            ]
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name or slug already exists'
            });
        }

        const category = await Category.create({
            name: name.trim(),
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            displayOrder: displayOrder || 0,
            showInNavbar: showInNavbar !== undefined ? showInNavbar : true,
            description: description || '',
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const { name, slug, displayOrder, showInNavbar, isActive, description } = req.body;

        // Check if new name/slug conflicts with another category
        if (name || slug) {
            const conflictCategory = await Category.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    { name: name || category.name },
                    { slug: slug || category.slug }
                ]
            });

            if (conflictCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Another category with this name or slug already exists'
                });
            }
        }

        // Update fields
        if (name !== undefined) category.name = name.trim();
        if (slug !== undefined) category.slug = slug.trim().toLowerCase();
        if (displayOrder !== undefined) category.displayOrder = displayOrder;
        if (showInNavbar !== undefined) category.showInNavbar = showInNavbar;
        if (isActive !== undefined) category.isActive = isActive;
        if (description !== undefined) category.description = description;

        const updatedCategory = await category.save();

        res.json({
            success: true,
            message: 'Category updated successfully',
            category: updatedCategory
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has products
        const productCount = await Product.countDocuments({
            category: category.slug
        });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${productCount} product(s) are using this category. Please reassign or delete those products first.`
            });
        }

        await category.deleteOne();

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Toggle category active status
 * @route   PATCH /api/categories/:id/toggle
 * @access  Private/Admin
 */
export const toggleCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            category
        });
    } catch (error) {
        console.error('Toggle category error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};