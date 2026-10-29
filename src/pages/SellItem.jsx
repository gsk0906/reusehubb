import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, uploadImage } from '../api';
import { useToast } from '../context/ToastContext';
import ItemImage from '../components/ItemImage';
import { formatPrice } from '../utils/format';

const CATEGORIES = [
  'Textbooks',
  'Calculators',
  'Lab Equipment',
  'Drawing Instruments',
  'Hostel Essentials',
  'Electronics',
  'Other',
];

const CONDITIONS = [
  { value: 'New', label: 'New (Unused / Sealed condition)' },
  { value: 'Like New', label: 'Like New (Barely used, crisp pages / body)' },
  { value: 'Good', label: 'Good (Minor pencil markings, 100% functional)' },
  { value: 'Fair', label: 'Fair (Visible wear, fully usable)' },
];

const SAMPLE_IMAGES = {
  Textbooks: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  Calculators: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
  'Lab Equipment': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  'Drawing Instruments': 'https://images.unsplash.com/photo-1585336261026-6a4574972f07?auto=format&fit=crop&w=600&q=80',
  'Hostel Essentials': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
};

const SellItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Textbooks',
    price: '',
    condition: 'Good',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleApplySampleImage = (cat) => {
    const sample = SAMPLE_IMAGES[cat] || SAMPLE_IMAGES['Textbooks'];
    setFormData((prev) => ({ ...prev, imageUrl: sample }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum allowed size is 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const data = await uploadImage(file);
      if (data?.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        toast.success('Photo uploaded successfully!');
        if (errors.imageUrl) {
          setErrors((prev) => ({ ...prev, imageUrl: '' }));
        }
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Item title is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a brief description for students.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category.';
    }

    if (formData.price === '' || formData.price === null || formData.price === undefined) {
      newErrors.price = 'Price is required.';
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Please enter a valid price in ₹ (0 for free exchange).';
    }

    if (!formData.condition) {
      newErrors.condition = 'Please select the item condition.';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Please provide a photo image URL or upload a photo.';
    } else if (!/^https?:\/\/.+/i.test(formData.imageUrl.trim()) && !formData.imageUrl.startsWith('/uploads/')) {
      newErrors.imageUrl = 'Image URL must start with http:// or https:// (or upload from device)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        condition: formData.condition,
        imageUrl: formData.imageUrl.trim(),
        image: formData.imageUrl.trim(),
      };

      const result = await createItem(payload);
      toast.success('Your item has been listed on ReUseHub!');

      const createdId = result?.item?._id || result?.item?.id || result?._id || result?.id;
      if (createdId) {
        navigate(`/items/${createdId}`);
      } else {
        navigate('/my-listings');
      }
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to list item. Please check your inputs.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sell-page">
      <div className="sell-container">
        <div className="sell-header">
          <div className="header-badge">✨ Campus Circulation & Sustainability</div>
          <h1 className="sell-title">List an Item for Sale or Exchange</h1>
          <p className="sell-subtitle">
            Help campus juniors save money by passing on your textbooks, drafters, and hostel gear.
          </p>
        </div>

        <div className="sell-layout">
          {/* Main Form */}
          <form onSubmit={handleSubmit} className="sell-form-card" noValidate>
            {/* Title */}
            <div className="form-group">
              <label htmlFor="item-title">Item Title</label>
              <span id="title-hint" className="field-hint">Include author, edition, or brand name</span>
              <input
                type="text"
                id="item-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Higher Engineering Mathematics by B.S. Grewal or Casio fx-991EX"
                required
                aria-describedby="title-hint"
                className={errors.title ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.title && <div className="error-text">❌ {errors.title}</div>}
            </div>

            {/* Category & Condition Grid */}
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="item-category">Category</label>
                <select
                  id="item-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select-input"
                  disabled={submitting}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <div className="error-text">❌ {errors.category}</div>}
              </div>

              {/* Price in ₹ */}
              <div className="form-group">
                <label htmlFor="item-price">Price (₹)</label>
                <span id="price-hint" className="field-hint">Set to 0 for free exchange / donation</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  id="item-price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 450"
                  required
                  aria-describedby="price-hint"
                  className={errors.price ? 'input-error' : ''}
                  disabled={submitting}
                />
                {errors.price && <div className="error-text">❌ {errors.price}</div>}
              </div>
            </div>

            {/* Condition */}
            <div className="form-group">
              <label htmlFor="item-condition">Condition</label>
              <select
                id="item-condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="select-input"
                disabled={submitting}
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.condition && <div className="error-text">❌ {errors.condition}</div>}
            </div>

            {/* Image URL */}
            <div className="form-group">
              <label htmlFor="item-image">Photo Image URL</label>
              <span id="img-hint" className="field-hint">
                Use a direct image link (ending in .jpg, .png, .webp)
              </span>
              <input
                type="url"
                id="item-image"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                required
                aria-describedby="img-hint"
                className={errors.imageUrl ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.imageUrl && <div className="error-text">❌ {errors.imageUrl}</div>}

              {/* Sample link helper & file upload */}
              <div className="sample-img-row">
                <label className="btn-sample" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  📁 {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={uploadingImage || submitting}
                  />
                </label>
                <span className="sample-label">Or:</span>
                <button
                  type="button"
                  className="btn-sample"
                  onClick={() => handleApplySampleImage(formData.category)}
                  disabled={uploadingImage || submitting}
                >
                  Use {formData.category} Sample
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="item-desc">Description & Handover Details</label>
              <span id="desc-hint" className="field-hint">Mention highlighting, missing scales, or preferred campus pickup spot</span>
              <textarea
                id="item-desc"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Used for 2nd semester Engineering Mathematics. Clean pages with minimal pencil markings. Pickup available near Block B hostel entrance."
                required
                aria-describedby="desc-hint"
                className={errors.description ? 'input-error' : ''}
                disabled={submitting}
              ></textarea>
              {errors.description && <div className="error-text">❌ {errors.description}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submitting}
            >
              {submitting ? 'Publishing Listing...' : 'Publish Listing to Campus'}
            </button>
          </form>

          {/* Live Preview Card */}
          <aside className="sell-preview-sidebar">
            <h3 className="preview-heading">👁️ Live Card Preview</h3>
            <p className="preview-sub">This is how other students will see your listing.</p>

            <div className="preview-card-wrap">
              <div className="item-card">
                <div className="item-card-media">
                  <ItemImage
                    src={formData.imageUrl}
                    alt={formData.title || 'Preview'}
                    className="item-card-img"
                  />
                  <div className="item-card-badges">
                    <span className="status-badge badge-available badge-small">
                      <span className="badge-icon">●</span>
                      <span className="badge-text">Available</span>
                    </span>
                    <span className="status-badge badge-condition-good badge-small">
                      <span className="badge-icon">👍</span>
                      <span className="badge-text">{formData.condition}</span>
                    </span>
                  </div>
                </div>

                <div className="item-card-content">
                  <div className="item-card-meta-top">
                    <span className="item-category-tag">{formData.category}</span>
                    <span className="item-price">
                      {formatPrice(formData.price || 0)}
                    </span>
                  </div>
                  <h4 className="item-card-title">
                    {formData.title || 'Your item title will appear here'}
                  </h4>
                  <div className="item-card-footer">
                    <span className="seller-name">Your Campus Profile</span>
                    <span className="view-details-arrow">View →</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SellItem;
