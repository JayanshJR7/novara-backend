import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import './Products.css';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const categories = [
    { id: 'all', name: 'All Collections', icon: '✦', emoji: '💎' },
  ];

  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    setCategory(categoryParam);
    fetchProducts(categoryParam);
  }, [searchParams]);

  const fetchProducts = async (categoryFilter) => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll({ category: categoryFilter });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (cat) => {
    return cat
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCategoryChange = (catId) => {
    setCategory(catId);
    navigate(`/products?category=${catId}`);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getCurrentCategoryIcon = () => {
    const cat = categories.find(c => c.id === category);
  };

  if (loading) {
    return (
      <div className="products-page-enhanced">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Discovering treasures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page-enhanced">
      <Navbar />
      
      {/* Hero Header Section */}
      <div className="products-hero">
        <div className="hero-background">
          <div className="hero-blob hero-blob-1"></div>
          <div className="hero-blob hero-blob-2"></div>
        </div>
        
        <div className="hero-content">
          <button onClick={() => navigate(-1)} className="back-btn-enhanced">
            <FiArrowLeft /> <span>Back</span>
          </button>
          
          <div className="hero-title-section">
            <div className="category-icon-large">{getCurrentCategoryIcon()}</div>
            <h1 className="hero-title">{formatCategoryName(category)}</h1>
            <p className="hero-subtitle">
              {products.length} {products.length === 1 ? 'piece' : 'pieces'} of pure elegance
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-container-enhanced">
        {products.length > 0 ? (
          <div className="products-grid-enhanced">
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product}
                onMouseEnter={() => setHoveredCard(product._id)}
                onMouseLeave={() => setHoveredCard(null)}
              />
            ))}
          </div>
        ) : (
          <div className="no-products-enhanced">
            <div className="no-products-icon">🔍</div>
            <h3>No Products Found</h3>
            <p>We couldn't find any products in this category.</p>
            <button 
              className="browse-all-btn"
              onClick={() => handleCategoryChange('all')}
            >
              Browse All Collections
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;