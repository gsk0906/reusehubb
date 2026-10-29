import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyItems, updateItem, deleteItem, markItemAsSold } from '../api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
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

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const MyListings = () => {
  const { toast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    condition: '',
    imageUrl: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // Fetch items listed by current user
  const loadMyItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyItems();
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to load your listings.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMyItems();
  }, [loadMyItems]);

  // Handle Mark as Sold
  const handleMarkAsSold = async (itemId) => {
    setActionInProgressId(itemId);
    try {
      await markItemAsSold(itemId);
      toast.success('Listing marked as Sold!');
      setItems((prev) =>
        prev.map((item) => {
          const id = item._id || item.id;
          if (id === itemId) {
            return { ...item, isSold: true, status: 'Sold' };
          }
          return item;
        })
      );
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to update item status.';
      toast.error(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Textbooks',
      price: item.price !== undefined ? item.price : '',
      condition: item.condition || 'Good',
      imageUrl: item.imageUrl || item.image || '',
    });
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setEditingItem(null);
    setEditFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      condition: '',
      imageUrl: '',
    });
  };

  // Save Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const itemId = editingItem._id || editingItem.id;
    setSavingEdit(true);

    try {
      const payload = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        category: editFormData.category,
        price: parseFloat(editFormData.price),
        condition: editFormData.condition,
        imageUrl: editFormData.imageUrl.trim(),
        image: editFormData.imageUrl.trim(),
      };

      const result = await updateItem(itemId, payload);
      toast.success('Listing updated successfully!');

      const updated = result?.item || { ...editingItem, ...payload };
      setItems((prev) =>
        prev.map((item) => ((item._id || item.id) === itemId ? updated : item))
      );

      handleCloseEdit();
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to update listing.';
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenDelete = (item) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const itemId = deleteTarget._id || deleteTarget.id;
    setDeleting(true);

    try {
      await deleteItem(itemId);
      toast.success('Listing deleted successfully.');
      setItems((prev) => prev.filter((item) => (item._id || item.id) !== itemId));
      setDeleteTarget(null);
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to delete listing.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Page Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Campus Listings</h1>
            <p className="dashboard-subtitle">
              Manage your active and sold listings, edit prices, or mark items as completed.
            </p>
          </div>
          <Link to="/sell" className="btn btn-primary">
            + Post New Listing
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="dashboard-loading">
            <LoadingSpinner text="Fetching your listings..." />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Error:</strong> {error}
            </div>
            <button type="button" onClick={loadMyItems} className="btn btn-primary btn-sm ml-auto">
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon="🏷️"
            title="You haven't listed any items yet"
            description="Got semester textbooks, drafters, or hostel items you no longer use? List them to connect with students on campus."
            actionLabel="List an Item"
            actionLink="/sell"
          />
        )}

        {/* Listings Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="listings-grid">
            {items.map((item) => {
              const itemId = item._id || item.id;
              const isItemSold =
                item.isSold ||
                (typeof item.status === 'string' && item.status.toLowerCase() === 'sold');
              const displayStatus = isItemSold ? 'Sold' : 'Available';

              return (
                <div key={itemId} className={`listing-card ${isItemSold ? 'card-sold' : ''}`}>
                  <div className="listing-card-media">
                    <ItemImage
                      src={item.imageUrl || item.image}
                      alt={item.title}
                      className="listing-thumb"
                    />
                    <div className="listing-badge-stack">
                      <StatusBadge status={displayStatus} size="small" />
                      {item.condition && <StatusBadge status={item.condition} size="small" />}
                    </div>
                  </div>

                  <div className="listing-card-body">
                    <div className="listing-header-row">
                      <span className="item-category-tag">{item.category}</span>
                      <span className="listing-price">{formatPrice(item.price)}</span>
                    </div>

                    <h3 className="listing-title">
                      <Link to={`/items/${itemId}`} className="listing-title-link">
                        {item.title}
                      </Link>
                    </h3>

                    <p className="listing-snippet">
                      {item.description || 'No description provided.'}
                    </p>

                    <div className="listing-actions">
                      <Link to={`/items/${itemId}`} className="btn btn-outline btn-sm">
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="btn btn-outline btn-sm"
                        title="Edit title, price, or details"
                      >
                        ✏️ Edit
                      </button>

                      {!isItemSold && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsSold(itemId)}
                          disabled={actionInProgressId === itemId}
                          className="btn btn-success btn-sm"
                          title="Mark this item as sold to a student"
                        >
                          {actionInProgressId === itemId ? 'Updating...' : '✓ Mark as Sold'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenDelete(item)}
                        className="btn btn-danger-outline btn-sm"
                        title="Delete listing"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Delete Campus Listing"
          message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Keep Listing"
          confirmVariant="danger"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="modal-backdrop" onClick={savingEdit ? undefined : handleCloseEdit}>
            <div
              className="modal-card modal-card-lg"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-modal-title"
            >
              <div className="modal-header">
                <h3 id="edit-modal-title" className="modal-title">
                  Edit Listing
                </h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={handleCloseEdit}
                  disabled={savingEdit}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="modal-body modal-scroll-body">
                  <div className="form-group">
                    <label htmlFor="edit-title">Title</label>
                    <input
                      type="text"
                      id="edit-title"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="edit-cat">Category</label>
                      <select
                        id="edit-cat"
                        value={editFormData.category}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, category: e.target.value }))
                        }
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-price">Price (₹)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        id="edit-price"
                        value={editFormData.price}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder="e.g. 450"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-cond">Condition</label>
                    <select
                      id="edit-cond"
                      value={editFormData.condition}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, condition: e.target.value }))
                      }
                    >
                      {CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-img">Image URL</label>
                    <input
                      type="url"
                      id="edit-img"
                      value={editFormData.imageUrl}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-desc">Description</label>
                    <textarea
                      id="edit-desc"
                      rows="3"
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseEdit}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                    {savingEdit ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
