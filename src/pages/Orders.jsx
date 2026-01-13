import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api';
import { FiUpload, FiArrowLeft } from 'react-icons/fi';
import './AddProduct.css'; // Reuse same CSS

const EditProduct = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemname: '',
    itemCode: '',
    basePrice: '',
    silverWeight: '',
    makingCharge: '',
    category: 'all',
    description: '',
    inStock: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Protect admin route
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchProduct();
  }, [isAdmin, id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getById(id);
      const product = data.product;

      setFormData({
        itemname: product.itemname,
        itemCode: product.itemCode,
        basePrice: product.basePrice,
        silverWeight: product.silverWeight,
        makingCharge: product.makingCharge,
        category: product.category,
        description: product.description || '',
        inStock: product.inStock
      });

      setImagePreview(product.itemImage);
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('itemname', formData.itemname);
      formDataToSend.append('itemCode', formData.itemCode.toUpperCase());
      formDataToSend.append('basePrice', formData.basePrice);
      formDataToSend.append('silverWeight', formData.silverWeight);
      formDataToSend.append('makingCharge', formData.makingCharge || 0);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('inStock', formData.inStock);

      if (imageFile) {
        formDataToSend.append('itemImage', imageFile);
      }

      await productsAPI.updateProduct(id, formDataToSend);

      alert('Product updated successfully!');
      navigate('/admin');

    } catch (err) {
      console.error('Update product error:', err);
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-product-page">
        <div className="container">
          <div className="loading">Loading product...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-page">
      <div className="container">

        <button className="back-btn" onClick={() => navigate('/admin')}>
          <FiArrowLeft /> Back to Dashboard
        </button>

        <h1>Edit Product</h1>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="product-form">

          {/* Image Upload */}
          <div className="form-section">
            <h3>Product Image</h3>

            <div className="image-upload-section">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="image-upload-label">
                  <FiUpload />
                  <span>Click to upload new image</span>
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
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="all">All</option>
                <option value="rings">Rings</option>
                <option value="earrings">Earrings</option>
                <option value="daily-wear">Daily Wear</option>
                <option value="gifting">Gifting</option>
                <option value="wedding">Wedding</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                />
                <span>In Stock</span>
              </label>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="form-section">
            <h3>Pricing Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Base Price (₹) *</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Silver Weight (grams) *</label>
                <input
                  type="number"
                  name="silverWeight"
                  value={formData.silverWeight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Making Charge (₹)</label>
                <input
                  type="number"
                  name="makingCharge"
                  value={formData.makingCharge}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="pricing-note">
              <p>💡 Final Price = Base Price + (Silver Weight × Current Silver Price) + Making Charge</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Updating Product...' : 'Update Product'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default EditProduct;