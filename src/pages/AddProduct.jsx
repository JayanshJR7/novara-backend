import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI, categoriesAPI } from '../services/api';
import { FiUpload, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AddProduct.css';

const AddProduct = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemname: '',
    itemCode: '',
    basePrice: '',
    category: '',
    description: ''
  });

  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');

  // Protect admin route
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoriesAPI.getActive();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.itemname.trim()) {
      setError('Please enter product name');
      return false;
    }

    if (!formData.itemCode.trim()) {
      setError('Please enter product code');
      return false;
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      setError('Please enter a valid base price');
      return false;
    }

    if (!formData.category) {
      setError('Please select a category');
      return false;
    }

    if (!imageFile) {
      setError('Please upload a product image');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
e.preventDefault();
setError('');
if (!validateForm()) {
  return;
}

setLoading(true);

try {
  const formDataToSend = new FormData();
  
  formDataToSend.append('itemname', formData.itemname.trim());
  formDataToSend.append('itemCode', formData.itemCode.trim().toUpperCase());
  formDataToSend.append('basePrice', formData.basePrice.toString());
  formDataToSend.append('category', formData.category);
  formDataToSend.append('description', formData.description.trim());
  formDataToSend.append('itemImage', imageFile);

  const response = await productsAPI.createProduct(formDataToSend);
  toast.success('✅ Product added successfully!');
  navigate('/admin');

} catch (err) {
  console.error('Add product error:', err);
  const errorMessage = err.response?.data?.message || 'Failed to add product. Please try again.';
  setError(errorMessage);
  toast.error(errorMessage);
} finally {
  setLoading(false);
}
};
return (
<div className="add-product-page">
<div className="container">
<button className="back-btn" onClick={() => navigate('/admin')}>
<FiArrowLeft /> Back to Dashboard
</button>
    <h1>Add New Product</h1>

    {error && (
      <div className="error-message">
        ❌ {error}
      </div>
    )}

    <form onSubmit={handleSubmit} className="product-form">
      {/* Image Upload */}
      <div className="form-section">
        <h3>Product Image *</h3>
        <div className="image-upload-section">
          {imagePreview ? (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" loading='lazy' />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                }}
              >
                Remove Image
              </button>
            </div>
          ) : (
            <label className="image-upload-label">
              <FiUpload />
              <span>Click to upload image</span>
              <small>JPG, PNG, GIF or WEBP (Max 5MB)</small>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="form-section">
        <h3>Basic Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="itemname"
              value={formData.itemname}
              onChange={handleChange}
              placeholder="e.g., Classic Silver Ring"
              required
            />
          </div>

          <div className="form-group">
            <label>Product Code *</label>
            <input
              type="text"
              name="itemCode"
              value={formData.itemCode}
              onChange={handleChange}
              placeholder="e.g., NJ-RING-001"
              className='code-input'
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Category *</label>
          {loadingCategories ? (
            <select disabled>
              <option>Loading categories...</option>
            </select>
          ) : (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description..."
            rows="4"
          />
        </div>
      </div>

      {/* Pricing Information */}
      <div className="form-section">
        <h3>Pricing Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Product Price (₹) *</label>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              placeholder="10000"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="pricing-note">
          <p>💡 Final Price (after 10% discount) = ₹{formData.basePrice ? (formData.basePrice * 0.9).toFixed(2) : '0'}</p>
        </div>
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={loading || loadingCategories}
      >
        {loading ? (
          <>
            <span className="spinner-small"></span>
            Adding Product...
          </>
        ) : (
          'Add Product'
        )}
      </button>
    </form>
  </div>
</div>
);
};
export default AddProduct;