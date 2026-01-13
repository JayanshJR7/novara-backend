import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
      loadWishlist();
    } else {
      // Load from localStorage for guest users
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const localWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
      setCart(localCart);
      setWishlist(localWishlist);
      setCartCount(localCart.length);
      setWishlistCount(localWishlist.length);
    }
  }, [isAuthenticated]);

  // Calculate cart total whenever cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => {
      return sum + (item.itemTotal || 0);
    }, 0);
    setCartTotal(total);
    setCartCount(cart.length);
  }, [cart]);

  // Load cart from API
  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartAPI.getCart();
      setCart(data.cart || []);
      setCartTotal(data.cartTotal || 0);
      setCartCount(data.cart?.length || 0);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setCart([]);
      setCartTotal(0);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const data = await cartAPI.getWishlist();
      setWishlist(data.wishlist || []);
      setWishlistCount(data.wishlist?.length || 0);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setWishlist([]);
      setWishlistCount(0);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {

      if (isAuthenticated) {
        const response = await cartAPI.addToCart(productId, quantity);
        await loadCart();
        return true;
      } else {
        const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItemIndex = localCart.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
          localCart[existingItemIndex].quantity += quantity;
        } else {
          localCart.push({ productId, quantity });
        }

        localStorage.setItem('guestCart', JSON.stringify(localCart));
        setCart(localCart);
        setCartCount(localCart.length);
        return true;
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      console.error('Error response:', err.response?.data);
      throw err;
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    try {
      if (quantity < 1) return;

      if (isAuthenticated) {
        // Find the correct productId - it might be nested in product object
        const cartItem = cart.find(item =>
          item.productId === productId ||
          item.product?._id === productId ||
          item._id === productId
        );

        if (!cartItem) {
          console.error('Cart item not found for productId:', productId);
          return;
        }

        // Use the actual productId from the cart item
        const actualProductId = cartItem.productId || cartItem.product?._id;

        setCart(prevCart =>
          prevCart.map(item => {
            const itemProductId = item.productId || item.product?._id;
            if (itemProductId === actualProductId) {
              return {
                ...item,
                quantity,
                itemTotal: (item.price || item.product?.finalPrice || 0) * quantity  // ✅ NEW
              };
            }
            return item;
          })
        );
        // Then sync with backend
        await cartAPI.updateCartItem(actualProductId, quantity);
        await loadCart();
      } else {
        const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const item = localCart.find(item => item.productId === productId);
        if (item) {
          item.quantity = quantity;
          localStorage.setItem('guestCart', JSON.stringify(localCart));
          setCart(localCart);
        }
      }
    } catch (err) {
      console.error('Failed to update cart:', err);
      console.error('Error details:', err.response?.data);
      // Reload cart to revert optimistic update
      await loadCart();
      throw err;
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        await cartAPI.removeFromCart(productId);
        await loadCart();
      } else {
        const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const filtered = localCart.filter(item => item.productId !== productId);
        localStorage.setItem('guestCart', JSON.stringify(filtered));
        setCart(filtered);
        setCartCount(filtered.length);
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      throw err;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await cartAPI.clearCart();
        setCart([]);
        setCartTotal(0);
        setCartCount(0);
      } else {
        localStorage.removeItem('guestCart');
        setCart([]);
        setCartCount(0);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
      throw err;
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId) => {
    try {
      if (isAuthenticated) {
        await cartAPI.addToWishlist(productId);
        await loadWishlist();
        return true;
      } else {
        const localWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        if (!localWishlist.includes(productId)) {
          localWishlist.push(productId);
          localStorage.setItem('guestWishlist', JSON.stringify(localWishlist));
          setWishlist(localWishlist);
          setWishlistCount(localWishlist.length);
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      throw err;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      if (isAuthenticated) {
        await cartAPI.removeFromWishlist(productId);
        await loadWishlist();
      } else {
        const localWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        const filtered = localWishlist.filter(id => id !== productId);
        localStorage.setItem('guestWishlist', JSON.stringify(filtered));
        setWishlist(filtered);
        setWishlistCount(filtered.length);
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      throw err;
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (!productId) return false;

    return wishlist.some(item => {
      // Handle both object and string format
      if (typeof item === 'string') {
        return item === productId;
      }
      return item._id === productId;
    });
  };

  const value = {
    cart,
    wishlist,
    cartTotal,
    cartCount,
    wishlistCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshCart: loadCart,
    refreshWishlist: loadWishlist
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};