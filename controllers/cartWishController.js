import User from "../models/user.js";
import Product from "../models/products.js";

/**
 * @desc    Add item to wishlist
 * @route   POST /api/users/wishlist/:productId
 * @access  Private
 */

export const addToWishlist = async (req, res) => {
    try {
        const { productID } = req.params;

        //check if product exists
        let product = await Product.findById(productID);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        // find user
        const user = await User.findById(req.user._id);

        // check if product is already in wishlist
        if (user.wishlist.includes(productID)) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist"
            })
        }

        //add to wishlist
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
        //find user
        const user = await User.findById(req.user._id);

        //remove from wishlist
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


    // Validate input
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide valid product and quantity' 
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check stock
    if (!product.inStock) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product is out of stock' 
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    // Check if product already in cart
    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      // Update quantity if already in cart
      user.cart[cartItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item to cart
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

export const updateCartItem = async(req, res) => {
    try {
        const { productId } = req.params;  // FIXED: Changed from productID to productId
        const { quantity } = req.body;


        // Validate quantity
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid quantity"
            })
        }

        // Find user 
        const user = await User.findById(req.user._id);

        // Find cart item
        const cartItem = user.cart.find(item => item.product.toString() === productId);

        if (!cartItem) {
            return res.status(404).json({  // FIXED: was res(400) which is incorrect
                success: false,
                message: "Product not found in cart"
            })
        }

        // Update quantity
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

export const removeItemFromCart = async(req, res) => {
    try {
        const { productId } = req.params;  // FIXED: Changed from productID to productId

        // Find user
        const user = await User.findById(req.user._id);

        // Remove from cart
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
 * @desc    Get user's cart
 * @route   GET /api/users/cart
 * @access  Private
 */

/**
 * @desc    Get user's cart
 * @route   GET /api/users/cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  try {
    // Find user and populate cart with full product details
    const user = await User.findById(req.user._id).populate('cart.product');

    const cartWithPrices = user.cart.map(item => {
      if (!item.product) {
        console.error('Cart item missing product:', item);
        return null;
      }

      const productObj = item.product.toObject();
      return {
        productId: item.product._id,
        product: productObj,
        quantity: item.quantity,
        price: productObj.finalPrice,
        itemTotal: productObj.finalPrice * item.quantity
      };
    }).filter(item => item !== null);

    // Calculate cart total
    const cartTotal = cartWithPrices.reduce((total, item) => {
      return total + item.itemTotal;
    }, 0);

    res.json({
      success: true,
      count: cartWithPrices.length,
      cart: cartWithPrices,
      cartTotal
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Wishlist - Make sure it populates product details
/**
 * @desc    Get user's wishlist
 * @route   GET /api/users/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
  try {
    // Find user and populate wishlist with full product details
    const user = await User.findById(req.user._id).populate('wishlist');

    // Map wishlist items with finalPrice
    const wishlistWithPrices = user.wishlist.map(product => {
      if (!product) {
        console.error('Wishlist item is null');
        return null;
      }

      const productObj = product.toObject();
      return productObj;
    }).filter(item => item !== null);

    res.json({
      success: true,
      count: wishlistWithPrices.length,
      wishlist: wishlistWithPrices
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

export const clearCart = async(req, res) => {
    try {
        // Find user and clear the cart
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