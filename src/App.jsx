import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import NovaraLoader from './components/NovaraLoader';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/AdminDashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import RevenueAnalytics from './pages/RevenueAnalytics';
import ContactUs from './pages/ContactUs';
import TermsConditions from './pages/TermsCondition';
import ReturnPolicy from './pages/ReturnPolicy'
import Careguide from './pages/Careguide';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!isInitialLoad) return;

    const handleLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
      }, 500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [isInitialLoad]);

  return (
    <>
      {isLoading && isInitialLoad && <NovaraLoader />}
      
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="app">
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/order/:id" element={<OrderDetail />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/add-product" element={<AddProduct />} />
                  <Route path="/admin/edit-product/:id" element={<EditProduct />} />
                  <Route path="/admin/revenue-analytics" element={<RevenueAnalytics />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="/careguide" element={<Careguide />} />
                </Routes>
              </main>
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;