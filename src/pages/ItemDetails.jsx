import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchItemById, sendPurchaseRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ItemImage from '../components/ItemImage';
import { formatPrice } from '../utils/format';

const ItemDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Purchase request modal/form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Load item details
  const loadItem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchItemById(id);
      setItem(data?.item || data);
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to load item details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  // Determine if logged in user is the seller
  const isSeller = Boolean(
    user &&
    item &&
    item.seller &&
    (
      (item.seller._id && user._id && item.seller._id === user._id) ||
      (item.seller.id && user.id && item.seller.id === user.id) ||
      (typeof item.seller === 'string' && (item.seller === user._id || item.seller === user.id)) ||
      (item.seller.email && user.email && item.seller.email === user.email)
    )
  );

  const isSold = item?.isSold || (typeof item?.status === 'string' && item.status.toLowerCase() === 'sold');
  const statusLabel = isSold ? 'Sold' : 'Available';

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to contact the seller.');
      navigate('/login', { state: { from: { pathname: `/items/${id}` } } });
      return;
    }

    setSubmittingRequest(true);
    try {
      await sendPurchaseRequest({
        itemId: id,
        note: requestNote.trim() || 'Hi! I am interested in purchasing this campus listing.',
        message: requestNote.trim() || 'Hi! I am interested in purchasing this campus listing.',
      });
      toast.success('Purchase request sent to the seller!');
      setRequestSent(true);
      setShowRequestForm(false);
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to submit purchase request.';
      toast.error(msg);
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="item-details-loading">
        <LoadingSpinner text="Fetching item details..." />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="item-details-error">
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error || 'Item not found.'}</span>
        </div>
        <Link to="/" className="btn btn-primary mt-3">
          ← Return to Marketplace
        </Link>
      </div>
    );
  }

  const sellerObj = typeof item.seller === 'object' ? item.seller : null;
  const sellerName = sellerObj?.name || 'Campus Student';
  const sellerDept = sellerObj?.department || sellerObj?.hostel || 'Campus Department';

  return (
    <div className="item-details-page">
      <div className="item-details-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Marketplace</Link>
          <span className="breadcrumb-separator">/</span>
          {item.category && (
            <>
              <Link to={`/?category=${encodeURIComponent(item.category)}`}>{item.category}</Link>
              <span className="breadcrumb-separator">/</span>
            </>
          )}
          <span className="breadcrumb-current">{item.title}</span>
        </nav>

        <div className="item-details-grid">
          {/* Media / Image Column */}
          <div className="item-media-card">
            <div className="item-image-frame">
              <ItemImage
                src={item.imageUrl || item.image}
                alt={item.title}
                className="item-full-image"
              />
              {isSold && <div className="details-sold-banner">SOLD OUT</div>}
            </div>

            {/* Quick Campus Tips */}
            <div className="campus-safety-box">
              <h4 className="safety-title">🛡️ Campus Handover Tips</h4>
              <ul className="safety-list">
                <li>Meet in public campus areas (College Canteen, Central Library foyer, Hostel Gate).</li>
                <li>Verify drafter alignment, calculator display, or textbook condition before UPI payment.</li>
                <li>Support sustainable circular reuse on campus!</li>
              </ul>
            </div>
          </div>

          {/* Info & Action Column */}
          <div className="item-info-card">
            <div className="item-badges-row">
              <StatusBadge status={statusLabel} size="large" />
              {item.condition && <StatusBadge status={item.condition} size="large" />}
              <span className="category-pill">{item.category}</span>
            </div>

            <h1 className="item-main-title">{item.title}</h1>

            <div className="item-price-tag">
              <span className="price-val">{formatPrice(item.price)}</span>
            </div>

            <div className="item-description-block">
              <h3 className="section-title">Item Description</h3>
              <p className="description-text">
                {item.description || 'No detailed description provided by the seller.'}
              </p>
            </div>

            {/* Seller Information */}
            <div className="seller-profile-card">
              <div className="seller-avatar-large">
                {sellerName.charAt(0).toUpperCase()}
              </div>
              <div className="seller-details-text">
                <span className="seller-tag">Listed by</span>
                <h4 className="seller-full-name">{sellerName}</h4>
                <p className="seller-dept-info">📍 {sellerDept}</p>
              </div>
            </div>

            {/* Action Area: HIDDEN FOR SELLER */}
            <div className="item-action-area">
              {isSeller ? (
                <div className="seller-notice-box">
                  <div className="notice-icon">🏷️</div>
                  <div className="notice-text">
                    <strong>You are the seller of this listing.</strong>
                    <p>You can manage status, edit price, or delete this item from your dashboard.</p>
                  </div>
                  <Link to="/my-listings" className="btn btn-outline btn-block mt-2">
                    Manage in My Listings
                  </Link>
                </div>
              ) : isSold ? (
                <div className="sold-notice-box">
                  <span className="sold-icon">🔒</span>
                  <div>
                    <strong>This item has already been marked as sold.</strong>
                    <p>Browse other campus listings to find available alternatives.</p>
                  </div>
                </div>
              ) : !isAuthenticated ? (
                <div className="login-prompt-box">
                  <p>Interested in buying this item?</p>
                  <Link
                    to="/login"
                    state={{ from: { pathname: `/items/${id}` } }}
                    className="btn btn-primary btn-block btn-lg"
                  >
                    Log In to Send Purchase Request
                  </Link>
                </div>
              ) : requestSent ? (
                <div className="request-sent-box">
                  <span className="check-icon">✓</span>
                  <div>
                    <strong>Purchase Request Sent!</strong>
                    <p>The seller has been notified. Check your <Link to="/requests">Requests Tab</Link> to monitor status.</p>
                  </div>
                </div>
              ) : (
                <div className="purchase-request-section">
                  {!showRequestForm ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-block btn-lg send-request-btn"
                      onClick={() => setShowRequestForm(true)}
                    >
                      💬 Send Purchase Request
                    </button>
                  ) : (
                    <form onSubmit={handleSendRequest} className="request-form">
                      <div className="form-group">
                        <label htmlFor="request-message">Message to Seller (Optional)</label>
                        <textarea
                          id="request-message"
                          rows="3"
                          value={requestNote}
                          onChange={(e) => setRequestNote(e.target.value)}
                          placeholder="Hi! I am interested in this item. Can we meet near the library or canteen?"
                          disabled={submittingRequest}
                        ></textarea>
                      </div>

                      <div className="request-form-buttons">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowRequestForm(false)}
                          disabled={submittingRequest}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={submittingRequest}
                        >
                          {submittingRequest ? 'Sending Request...' : 'Confirm & Send Request'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
