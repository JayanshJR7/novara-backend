import Product from '../models/products.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Get all products with filters
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const { category, search, inStock } = req.query;

    let filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    if (search) {
      filter.$or = [
        { itemname: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch products from database
    const products = await Product.find(filter).sort({ createdAt: -1 });

    // NO PRICE CALCULATION NEEDED - finalPrice already stored in DB
    res.json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 🔥 Increment views
    await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: false }
    );

    // NO PRICE CALCULATION NEEDED
    res.json({
      success: true,
      product: product
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res) => {
  try {
    const { itemname, itemCode, basePrice, category, description } = req.body;

    if (!itemname) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }

    if (!itemCode) {
      return res.status(400).json({
        success: false,
        message: 'Item code is required'
      });
    }

    if (!basePrice || basePrice === 'undefined' || basePrice === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Base price is required'
      });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a product image'
      });
    }

    // Check if product code already exists
    const productExists = await Product.findOne({ itemCode: itemCode.toUpperCase() });
    if (productExists) {
      return res.status(400).json({
        success: false,
        message: `Product code ${itemCode} already exists`
      });
    }

    // Get Cloudinary URL from multer (uploaded by cloudinary storage)
    const itemImage = req.file.path;

    // Calculate final price (10% discount)
    const basePriceValue = parseFloat(basePrice);
    const finalPrice = basePriceValue * 0.9;

    // Create new product
    const product = await Product.create({
      itemname: itemname.trim(),
      itemCode: itemCode.toUpperCase().trim(),
      itemImage,
      basePrice: basePriceValue,
      finalPrice: finalPrice,
      category: category || 'all',
      description: description ? description.trim() : '',
      inStock: true
    });


    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);

    // If product creation fails but image was uploaded, delete from Cloudinary
    if (req.file && req.file.path) {
      try {
        await deleteFromCloudinary(req.file.path);
      } catch (deleteError) {
        console.error('Failed to delete orphaned image:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 * 
 * FLOW: If new image uploaded → Upload to Cloudinary → Delete old image → Update MongoDB
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const oldImageUrl = product.itemImage;

    // Update fields if provided
    product.itemname = req.body.itemname || product.itemname;

    if (req.body.itemCode) {
      const newCode = req.body.itemCode.toUpperCase();
      if (newCode !== product.itemCode) {
        const codeExists = await Product.findOne({
          itemCode: newCode,
          _id: { $ne: product._id }
        });
        if (codeExists) {
          return res.status(400).json({
            success: false,
            message: 'Product code already exists'
          });
        }
        product.itemCode = newCode;
      }
    }

    // Update basePrice and recalculate finalPrice
    if (req.body.basePrice !== undefined) {
      const newBasePrice = parseFloat(req.body.basePrice);
      product.basePrice = newBasePrice;
      product.finalPrice = newBasePrice * 0.9; // Recalculate with 10% discount
    }

    product.category = req.body.category || product.category;
    product.description = req.body.description || product.description;
    product.inStock = req.body.inStock !== undefined ? req.body.inStock : product.inStock;

    // Handle image update
    if (req.file) {
      product.itemImage = req.file.path;

      try {
        await deleteFromCloudinary(oldImageUrl);
      } catch (deleteError) {
        console.error('Failed to delete old image:', deleteError);
      }
    }

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        await deleteFromCloudinary(req.file.path);
      } catch (deleteError) {
        console.error('Failed to delete orphaned image:', deleteError);
      }
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 * 
 * FLOW: Delete from MongoDB → Delete image from Cloudinary
 */
export const deleteProduct = async (req, res) => {
  try {
    // Find product by ID
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Store image URL before deleting product
    const imageUrl = product.itemImage;

    // Delete product from MongoDB
    await product.deleteOne();

    // Delete image from Cloudinary
    try {
      await deleteFromCloudinary(imageUrl);
    } catch (deleteError) {
      console.error('Failed to delete image from Cloudinary:', deleteError);
      // Product is already deleted, so just log the error
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category }).sort({ createdAt: -1 });

    // NO PRICE CALCULATION NEEDED
    res.json({
      success: true,
      count: products.length,
      category,
      products: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get trending products
 * @route   GET /api/products/trending
 * @access  Public
 */
export const getTrendingProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;

    const products = await Product.aggregate([
      {
        $addFields: {
          recencyBoost: {
            $cond: [
              {
                $gte: [
                  "$createdAt",
                  new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
                ]
              },
              10,
              0
            ]
          }
        }
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              "$views",
              { $multiply: ["$ordersCount", 6] },
              { $multiply: ["$wishlistedCount", 3] },
              "$recencyBoost"
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: limit }
    ]);

    // NO PRICE CALCULATION NEEDED - finalPrice already in DB
    res.json({
      success: true,
      count: products.length,
      products: products
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

