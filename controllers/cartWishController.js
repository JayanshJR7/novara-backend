import User from "../models/user.js";
import Product from "../models/products.js";
import SilverPrice from "../models/silverPrice.js";

/**
 * Helper function to calculate real-time price
 */
const calculateRealTimePrice = (product, currentSilverPrice) => {
  if (product.weight && product.weight.silverWeight > 0) {
    return (
      product.basePrice +
      (product.weight.silverWeight * currentSilverPrice) +
      (product.makingCharge || 0)
    );
  }
  return product.finalPrice;
};

/**
 * @desc    Add item to wishlist
 * @route   POST /api/users/wishlist/:productId
 * @access  Private
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productID } = req.params;

    let product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(productID)) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist"
      })
    }

    user.wishlist.push(productID)
    await user.save();

    res.json({
      success: true,
      message: "Product added to wishlist",
      wishlist: user.wishlist,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * @desc    Remove item from wishlist
 * @route   DELETE /api/users/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save()

    res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * @desc    Add item to cart
 * @route   POST /api/users/cart
 * @access  Private
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid product and quantity'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    const user = await User.findById(req.user._id);

    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += parseInt(quantity);
    } else {
      user.cart.push({
        product: productId,
        quantity: parseInt(quantity)
      });
    }

    await user.save();
    await user.populate('cart.product');

    res.json({
      success: true,
      message: 'Product added to cart',
      cart: user.cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/users/cart/:productId
 * @access  Private
 */
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid quantity"
      })
    }

    const user = await User.findById(req.user._id);

    const cartItem = user.cart.find(item => item.product.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart"
      })
    }

    cartItem.quantity = quantity;

    await user.save();
    await user.populate('cart.product');

    res.json({
      success: true,
      message: "Cart item updated",
      cart: user.cart,
    })
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/users/cart/:productId
 * @access  Private
 */
export const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();

    res.json({
      success: true,
      message: "Product removed from cart",
      cart: user.cart,
    })

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * @desc    Get user's cart with REAL-TIME calculated prices
 * @route   GET /api/users/cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');

    // ✅ Get current silver price
    const silverPrice = await SilverPrice.getLatestPrice();

    const cartWithPrices = user.cart.map(item => {
      if (!item.product) {
        console.error('Cart item missing product:', item);
        return null;
      }

      const productObj = item.product.toObject();
      
      // ✅ Calculate REAL-TIME price based on current silver rate
      const itemPrice = calculateRealTimePrice(productObj, silverPrice.pricePerGram);
      
      return {
        productId: item.product._id,
        product: {
          ...productObj,
          finalPrice: itemPrice // Override with real-time price
        },
        quantity: item.quantity,
        price: itemPrice,
        itemTotal: itemPrice * item.quantity
      };
    }).filter(item => item !== null);

    const cartTotal = cartWithPrices.reduce((total, item) => {
      return total + item.itemTotal;
    }, 0);

    res.json({
      success: true,
      count: cartWithPrices.length,
      cart: cartWithPrices,
      cartTotal,
      silverPrice: silverPrice.pricePerGram
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user's wishlist with REAL-TIME calculated prices
 * @route   GET /api/users/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    // ✅ Get current silver price
    const silverPrice = await SilverPrice.getLatestPrice();

    // ✅ Calculate REAL-TIME prices for wishlist items
    const wishlistWithPrices = user.wishlist.map(product => {
      if (!product) {
        console.error('Wishlist item is null');
        return null;
      }

      const productObj = product.toObject();

      // Calculate real-time price
      productObj.finalPrice = calculateRealTimePrice(productObj, silverPrice.pricePerGram);

      return productObj;
    }).filter(item => item !== null);

    res.json({
      success: true,
      count: wishlistWithPrices.length,
      wishlist: wishlistWithPrices,
      silverPrice: silverPrice.pricePerGram
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/users/cart
 * @access  Private
 */
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}