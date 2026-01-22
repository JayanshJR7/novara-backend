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

    const products = await Product.find(filter).sort({ createdAt: -1 });

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

    await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: false }
    );

    res.json({
      success: true,
      product: product
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create new product with MULTIPLE IMAGES
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res) => {
  try {
    const { itemname, itemCode, basePrice, category, description, deliveryType } = req.body;

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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one product image'
      });
    }

    // Maximum 5 images validation
    if (req.files.length > 5) {
      // Delete uploaded files if exceeding limit
      for (const file of req.files) {
        try {
          await deleteFromCloudinary(file.path);
        } catch (err) {
          console.error('Failed to delete excess image:', err);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images allowed per product'
      });
    }

    const productExists = await Product.findOne({ itemCode: itemCode.toUpperCase() });
    if (productExists) {
      for (const file of req.files) {
        try {
          await deleteFromCloudinary(file.path);
        } catch (err) {
          console.error('Failed to delete image:', err);
        }
      }
      return res.status(400).json({
        success: false,
        message: `Product code ${itemCode} already exists`
      });
    }

    // Get all Cloudinary URLs from uploaded files (ARRAY)
    const itemImages = req.files.map(file => file.path);

    // Calculate final price (10% discount)
    const basePriceValue = parseFloat(basePrice);
    const finalPrice = basePriceValue * 0.9;

    let weightData;
    if (req.body.weight) {
      // If it's a string, parse it
      if (typeof req.body.weight === 'string') {
        weightData = JSON.parse(req.body.weight);
      }
      // If it's already an object
      else if (typeof req.body.weight === 'object') {
        weightData = {
          silverWeight: parseFloat(req.body.weight.silverWeight) || 0,
          grossWeight: parseFloat(req.body.weight.grossWeight) || 0,
          unit: req.body.weight.unit || 'grams'
        };
      }
    } else {
      weightData = {
        silverWeight: 0,
        grossWeight: 0,
        unit: 'grams'
      };
    }

    // Create new product
    const product = await Product.create({
      itemname: itemname.trim(),
      itemCode: itemCode.toUpperCase().trim(),
      itemImages,
      basePrice: basePriceValue,
      finalPrice: finalPrice,
      category: category || 'all',
      description: description ? description.trim() : '',
      inStock: true,
      deliveryType: deliveryType || 'ready-to-ship',
      weight: weightData,
    });


    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await deleteFromCloudinary(file.path);
        } catch (deleteError) {
          console.error('Failed to delete orphaned image:', deleteError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

/**
 * @desc    Update product with MULTIPLE IMAGES support
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Store old image URLs for deletion later
    const oldImageUrls = product.itemImages ? [...product.itemImages] : [product.itemImage];

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
    product.deliveryType = req.body.deliveryType || product.deliveryType;

    if (req.body.weight) {
      product.weight = {
        silverWeight: parseFloat(req.body.weight.silverWeight) || product.weight.silverWeight || 0,
        grossWeight: parseFloat(req.body.weight.grossWeight) || product.weight.grossWeight || 0,
        unit: req.body.weight.unit || product.weight.unit || 'grams'
      };
    }

    // Handle MULTIPLE image updates
    if (req.files && req.files.length > 0) {
      // Validate max 5 images
      if (req.files.length > 5) {
        for (const file of req.files) {
          try {
            await deleteFromCloudinary(file.path);
          } catch (err) {
            console.error('Failed to delete excess image:', err);
          }
        }
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 images allowed per product'
        });
      }

      // Set new images (ARRAY)
      product.itemImages = req.files.map(file => file.path);

      // Delete old images from Cloudinary
      for (const oldUrl of oldImageUrls) {
        try {
          await deleteFromCloudinary(oldUrl);
        } catch (deleteError) {
          console.error('Failed to delete old image:', deleteError);
        }
      }
    }

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    // Cleanup if update fails
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await deleteFromCloudinary(file.path);
        } catch (deleteError) {
          console.error('Failed to delete orphaned image:', deleteError);
        }
      }
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete product and ALL its images
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Store image URLs before deleting product (handle both old and new schema)
    const imageUrls = product.itemImages || [product.itemImage];

    // Delete product from MongoDB
    await product.deleteOne();

    // Delete ALL images from Cloudinary
    for (const imageUrl of imageUrls) {
      if (imageUrl) {
        try {
          await deleteFromCloudinary(imageUrl);
        } catch (deleteError) {
          console.error('Failed to delete image from Cloudinary:', deleteError);
        }
      }
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
    const limit = Number(req.query.limit) || 35;

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

      // 🔥 STEP 1: take top 60 trending
      { $sort: { trendingScore: -1 } },
      { $limit: 60 },

      // 🔥 STEP 2: random 35 from them
      { $sample: { size: limit } }
    ]);

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        products: [],
        suggestions: [],
        categories: []
      });
    }

    const searchTerm = query.trim();

    const products = await Product.find({
      $or: [
        { itemname: { $regex: searchTerm, $options: 'i' } },
        { itemCode: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .limit(20)
      .select('itemname itemCode category itemImages finalPrice basePrice deliveryType')
      .lean();

    const categorySuggestions = await Product.distinct('category', {
      category: { $regex: searchTerm, $options: 'i' }
    });

    const categories = [...new Set(products.map(p => p.category))];

    return res.status(200).json({
      success: true,
      products,
      categories,
      suggestions: categorySuggestions
    });

  } catch (error) {
    console.error('❌ Search error:', error.message);
    console.error('❌ Full error:', error);

    return res.status(500).json({
      success: false,
      message: 'Search failed: ' + error.message,
      products: [],
      suggestions: [],
      categories: []
    });
  }
};