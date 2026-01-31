import Product from '../models/products.js';
import SilverPrice from '../models/silverPrice.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * ✅ CORRECT PRICING FORMULA (as per client's requirement)
 * 
 * For products with netWeight > 0:
 * 1. silverCost = netWeight × silverPricePerGram
 * 2. makingCharges = makingChargeRate × netWeight
 * 3. total = basePrice + silverCost + makingCharges
 * 4. finalPrice = total × 0.9 (10% discount)
 * 
 * For products without netWeight:
 * finalPrice = basePrice × 0.9 (10% discount)
 */
const calculateRealTimePrice = (product, currentSilverPrice) => {
  // Check if product has net weight for auto-pricing
  if (product.weight && product.weight.netWeight > 0) {
    const netWeight = product.weight.netWeight;
    const makingChargeRate = product.makingChargeRate || 0;

    // Step 1: Calculate silver cost
    const silverCost = netWeight * currentSilverPrice;

    // Step 2: Calculate making charges
    const makingCharges = makingChargeRate * netWeight;

    // Step 3: Calculate total
    const total = product.basePrice + silverCost + makingCharges;

    // Step 4: Apply 10% discount
    const finalPrice = total * 0.9;

    return parseFloat(finalPrice.toFixed(2));
  }

  // Manual pricing: basePrice with 10% discount
  return parseFloat((product.basePrice * 0.9).toFixed(2));
};

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

    // Get current silver price
    const silverPrice = await SilverPrice.getLatestPrice();

    // Calculate real-time prices
    const productsWithPrice = products.map(product => {
      const productObj = product.toObject();
      productObj.finalPrice = calculateRealTimePrice(productObj, silverPrice.pricePerGram);
      return productObj;
    });

    res.json({
      success: true,
      count: productsWithPrice.length,
      silverPrice: silverPrice.pricePerGram,
      products: productsWithPrice
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

    // Increment view count
    await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: false }
    );

    const silverPrice = await SilverPrice.getLatestPrice();
    const productObj = product.toObject();

    // Calculate real-time price
    productObj.finalPrice = calculateRealTimePrice(productObj, silverPrice.pricePerGram);

    res.json({
      success: true,
      product: productObj,
      silverPrice: silverPrice.pricePerGram
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
export const createProduct = async (req, res) => {
  try {
    const { itemname, itemCode, basePrice, category, description, deliveryType, weight } = req.body;

    console.log('========== CREATE PRODUCT DEBUG ==========');
    console.log('req.body.weight:', req.body.weight);
    console.log('basePrice:', basePrice);
    console.log('makingChargeRate:', req.body.makingChargeRate);

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

    const itemImages = req.files.map(file => file.path);

    // Calculate initial finalPrice
    const basePriceValue = parseFloat(basePrice);
    let finalPrice;

    if (weight && weight.netWeight > 0) {

      const silverPrice = await SilverPrice.getLatestPrice();
      console.log('\n📊 CALCULATION INPUTS:');
      console.log('weight object:', weight);
      console.log('weight.netWeight:', weight.netWeight);
      console.log('typeof weight.netWeight:', typeof weight.netWeight);
      const netWeight = parseFloat(weight.netWeight);
      const makingChargeRate = parseFloat(req.body.makingChargeRate || 0);
      console.log('Parsed netWeight:', netWeight);
      console.log('makingChargeRate:', makingChargeRate);
      console.log('silverPrice.pricePerGram:', silverPrice.pricePerGram);

      const silverCost = netWeight * silverPrice.pricePerGram;
      const makingCharges = makingChargeRate * netWeight;
      const total = basePriceValue + silverCost + makingCharges;
      finalPrice = total * 0.9; // 10% discount
      console.log('\n💰 CALCULATION STEPS:');
      console.log('basePrice:', basePriceValue);
      console.log('silverCost:', silverCost);
      console.log('makingCharges:', makingCharges);
      console.log('total:', total);
      console.log('finalPrice:', finalPrice);
    } else {
      // MANUAL PRICING
      finalPrice = basePriceValue * 0.9; // 10% discount
      console.log('\n📝 MANUAL PRICING:', finalPrice);
    }

    // Create product
    const product = await Product.create({
      itemname: itemname.trim(),
      itemCode: itemCode.toUpperCase().trim(),
      itemImages,
      basePrice: basePriceValue,
      finalPrice: parseFloat(finalPrice.toFixed(2)),
      makingChargeRate: parseFloat(req.body.makingChargeRate) || 0,
      category: category || 'all',
      description: description ? description.trim() : '',
      inStock: true,
      deliveryType: deliveryType || 'ready-to-ship',
      weight: weight || { silverWeight: 0, netWeight: 0, grossWeight: 0, unit: 'grams' }
    });

    console.log('\n✅ PRODUCT SAVED:');
    console.log('Saved weight:', product.weight);
    console.log('Saved finalPrice:', product.finalPrice);
    console.log('==========================================\n');


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
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const oldImageUrls = product.itemImages ? [...product.itemImages] : [product.itemImage];

    // Update fields
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

      // Recalculate with correct formula
      if (req.body.weight && parseFloat(req.body.weight.netWeight) > 0) {
        const silverPrice = await SilverPrice.getLatestPrice();
        const netWeight = parseFloat(req.body.weight.netWeight);
        const makingChargeRate = parseFloat(req.body.makingChargeRate || product.makingChargeRate || 0);

        const silverCost = netWeight * silverPrice.pricePerGram;
        const makingCharges = makingChargeRate * netWeight;
        const total = newBasePrice + silverCost + makingCharges;
        product.finalPrice = parseFloat((total * 0.9).toFixed(2));
      } else {
        product.finalPrice = parseFloat((newBasePrice * 0.9).toFixed(2));
      }
    }

    product.category = req.body.category || product.category;
    product.description = req.body.description || product.description;
    product.inStock = req.body.inStock !== undefined ? req.body.inStock : product.inStock;
    product.deliveryType = req.body.deliveryType || product.deliveryType;

    if (req.body.weight) {
      product.weight = {
        silverWeight: parseFloat(req.body.weight.silverWeight) || product.weight.silverWeight || 0,
        netWeight: parseFloat(req.body.weight.netWeight) || product.weight.netWeight || 0,
        grossWeight: parseFloat(req.body.weight.grossWeight) || product.weight.grossWeight || 0,
        unit: req.body.weight.unit || product.weight.unit || 'grams'
      };
    }

    if (req.body.makingChargeRate !== undefined) {
      product.makingChargeRate = parseFloat(req.body.makingChargeRate);
    }

    // Handle image updates
    if (req.files && req.files.length > 0) {
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

      product.itemImages = req.files.map(file => file.path);

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
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const imageUrls = product.itemImages || [product.itemImage];

    await product.deleteOne();

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

    const silverPrice = await SilverPrice.getLatestPrice();
    const productsWithPrice = products.map(product => {
      const productObj = product.toObject();
      productObj.finalPrice = calculateRealTimePrice(productObj, silverPrice.pricePerGram);
      return productObj;
    });

    res.json({
      success: true,
      count: productsWithPrice.length,
      category,
      products: productsWithPrice
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
      { $sort: { trendingScore: -1 } },
      { $limit: 60 },
      { $sample: { size: limit } }
    ]);

    const silverPrice = await SilverPrice.getLatestPrice();
    const productsWithPrice = products.map(product => {
      product.finalPrice = calculateRealTimePrice(product, silverPrice.pricePerGram);
      return product;
    });

    res.json({
      success: true,
      count: productsWithPrice.length,
      products: productsWithPrice
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
      .select('itemname itemCode category itemImages finalPrice basePrice deliveryType weight makingChargeRate')
      .lean();

    const silverPrice = await SilverPrice.getLatestPrice();
    const productsWithPrice = products.map(product => {
      product.finalPrice = calculateRealTimePrice(product, silverPrice.pricePerGram);
      return product;
    });

    const categorySuggestions = await Product.distinct('category', {
      category: { $regex: searchTerm, $options: 'i' }
    });

    const categories = [...new Set(productsWithPrice.map(p => p.category))];

    return res.status(200).json({
      success: true,
      products: productsWithPrice,
      categories,
      suggestions: categorySuggestions
    });

  } catch (error) {
    console.error('❌ Search error:', error.message);

    return res.status(200).json({
      success: false,
      message: 'Search failed: ' + error.message,
      products: [],
      suggestions: [],
      categories: []
    });
  }
};