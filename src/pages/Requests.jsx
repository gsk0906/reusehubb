import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchReceivedRequests,
  fetchSentRequests,
  updateRequestStatus,
} from '../api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ItemImage from '../components/ItemImage';
import { formatPrice } from '../utils/format';

const Requests = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'

  // Received requests state
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [errorReceived, setErrorReceived] = useState(null);

  // Sent requests state
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingSent, setLoadingSent] = useState(true);
  const [errorSent, setErrorSent] = useState(null);

  // Status updating indicator
  const [updatingId, setUpdatingId] = useState(null);

  // Load received requests
  const loadReceived = useCallback(async () => {
    setLoadingReceived(true);
    setErrorReceived(null);
    try {
      const data = await fetchReceivedRequests();
      const list = Array.isArray(data) ? data : data?.requests || [];
      setReceivedRequests(list);
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to load received requests.';
      setErrorReceived(msg);
    } finally {
      setLoadingReceived(false);
    }
  }, []);

  // Load sent requests
  const loadSent = useCallback(async () => {
    setLoadingSent(true);
    setErrorSent(null);
    try {
      const data = await fetchSentRequests();
      const list = Array.isArray(data) ? data : data?.requests || [];
      setSentRequests(list);
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to load sent requests.';
      setErrorSent(msg);
    } finally {
      setLoadingSent(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadReceived();
    loadSent();
  }, [loadReceived, loadSent]);

  // Handle Accept or Reject
  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await updateRequestStatus(requestId, newStatus);
      toast.success(`Purchase request ${newStatus}!`);

      // Update in received requests list
      setReceivedRequests((prev) =>
        prev.map((req) => {
          const id = req._id || req.id;
          if (id === requestId) {
            return { ...req, status: newStatus };
          }
          return req;
        })
      );
    } catch (err) {
      const msg = err.friendlyMessage || `Failed to update request to ${newStatus}.`;
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Purchase & Exchange Requests</h1>
            <p className="dashboard-subtitle">
              Manage student requests for your listings and track items you requested on campus.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="tab-buttons-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'received'}
            className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            📥 Received Requests
            <span className="tab-counter">
              {receivedRequests.filter(
                (r) => (r.status || '').toLowerCase() === 'pending'
              ).length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sent'}
            className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            📤 Sent Requests
            <span className="tab-counter">{sentRequests.length}</span>
          </button>
        </div>

        {/* ===================== TAB 1: RECEIVED REQUESTS ===================== */}
        {activeTab === 'received' && (
          <section className="tab-panel">
            {loadingReceived ? (
              <div className="dashboard-loading">
                <LoadingSpinner text="Fetching received requests..." />
              </div>
            ) : errorReceived ? (
              <div className="alert alert-error">
                <span>⚠️ {errorReceived}</span>
                <button
                  type="button"
                  onClick={loadReceived}
                  className="btn btn-primary btn-sm ml-auto"
                >
                  Retry
                </button>
              </div>
            ) : receivedRequests.length === 0 ? (
              <EmptyState
                icon="📬"
                title="No purchase requests received yet"
                description="When students on campus request to buy your listed items, their requests will appear here for you to accept or reject."
                actionLabel="View My Listings"
                actionLink="/my-listings"
              />
            ) : (
              <div className="requests-list">
                {receivedRequests.map((req) => {
                  const reqId = req._id || req.id;
                  const item = req.item || req.itemId || {};
                  const buyer = req.buyer || req.user || req.sender || {};
                  const status = req.status || 'Pending';
                  const isPending = status.toLowerCase() === 'pending';

                  return (
                    <div key={reqId} className="request-card">
                      <div className="request-card-header">
                        <div className="request-item-snippet">
                          <div className="request-item-thumb-frame">
                            <ItemImage
                              src={item.imageUrl || item.image}
                              alt={item.title || 'Marketplace Item'}
                              className="request-item-thumb"
                            />
                          </div>
                          <div className="request-item-info">
                            <span className="request-type-badge">Received Inquiry</span>
                            <h3 className="request-item-title">
                              {item._id || item.id ? (
                                <Link to={`/items/${item._id || item.id}`}>
                                  {item.title || 'Marketplace Item'}
                                </Link>
                              ) : (
                                item.title || 'Campus Item'
                              )}
                            </h3>
                            {item.price !== undefined && (
                              <span className="request-item-price">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        <StatusBadge status={status} size="medium" />
                      </div>

                      <div className="request-card-body">
                        {/* Buyer Info */}
                        <div className="student-info-row">
                          <div className="student-avatar-wrap">
                            {(buyer.name || 'B').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="student-name">{buyer.name || 'Campus Student'}</h4>
                            <p className="student-sub">
                              📍 {buyer.department || buyer.hostel || 'Campus Member'}
                              {buyer.email && ` • ${buyer.email}`}
                            </p>
                          </div>
                        </div>

                        {/* Note/Message */}
                        {(req.note || req.message) && (
                          <div className="request-message-quote">
                            <span className="quote-label">Buyer Note:</span>
                            <p className="quote-body">"{req.note || req.message}"</p>
                          </div>
                        )}

                        {req.createdAt && (
                          <span className="request-date">
                            Received: {new Date(req.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Action buttons: Accept / Reject */}
                      {isPending ? (
                        <div className="request-card-footer">
                          <button
                            type="button"
                            className="btn btn-outline btn-danger-outline"
                            onClick={() => handleUpdateStatus(reqId, 'rejected')}
                            disabled={updatingId === reqId}
                          >
                            {updatingId === reqId ? 'Processing...' : '✕ Reject'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleUpdateStatus(reqId, 'accepted')}
                            disabled={updatingId === reqId}
                          >
                            {updatingId === reqId ? 'Processing...' : '✓ Accept Request'}
                          </button>
                        </div>
                      ) : (
                        <div className="request-decided-banner">
                          Request has been marked as <strong>{status}</strong>.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ===================== TAB 2: SENT REQUESTS ===================== */}
        {activeTab === 'sent' && (
          <section className="tab-panel">
            {loadingSent ? (
              <div className="dashboard-loading">
                <LoadingSpinner text="Fetching sent requests..." />
              </div>
            ) : errorSent ? (
              <div className="alert alert-error">
                <span>⚠️ {errorSent}</span>
                <button
                  type="button"
                  onClick={loadSent}
                  className="btn btn-primary btn-sm ml-auto"
                >
                  Retry
                </button>
              </div>
            ) : sentRequests.length === 0 ? (
              <EmptyState
                icon="📨"
                title="No purchase requests sent yet"
                description="Browse items on the campus marketplace and send purchase requests to student sellers."
                actionLabel="Browse Marketplace"
                actionLink="/"
              />
            ) : (
              <div className="requests-list">
                {sentRequests.map((req) => {
                  const reqId = req._id || req.id;
                  const item = req.item || req.itemId || {};
                  const seller = item.seller || req.seller || {};
                  const status = (req.status || 'Pending').toLowerCase();
                  const isAccepted = status === 'accepted';
                  const isPending = status === 'pending';
                  const isRejected = status === 'rejected';

                  return (
                    <div
                      key={reqId}
                      className={`request-card ${isAccepted ? 'request-card-accepted' : ''}`}
                    >
                      <div className="request-card-header">
                        <div className="request-item-snippet">
                          <div className="request-item-thumb-frame">
                            <ItemImage
                              src={item.imageUrl || item.image}
                              alt={item.title || 'Marketplace Item'}
                              className="request-item-thumb"
                            />
                          </div>
                          <div className="request-item-info">
                            <span className="request-type-badge sent">Sent to Seller</span>
                            <h3 className="request-item-title">
                              {item._id || item.id ? (
                                <Link to={`/items/${item._id || item.id}`}>
                                  {item.title || 'Marketplace Item'}
                                </Link>
                              ) : (
                                item.title || 'Campus Item'
                              )}
                            </h3>
                            {item.price !== undefined && (
                              <span className="request-item-price">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        <StatusBadge status={req.status || 'Pending'} size="medium" />
                      </div>

                      <div className="request-card-body">
                        {/* Seller summary */}
                        <div className="student-info-row">
                          <div className="student-avatar-wrap">
                            {(typeof seller === 'object' ? seller.name || 'S' : 'S')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h4 className="student-name">
                              Seller: {typeof seller === 'object' ? seller.name : 'Campus Student'}
                            </h4>
                            <p className="student-sub">
                              📍{' '}
                              {typeof seller === 'object'
                                ? seller.department || seller.hostel || 'Campus Member'
                                : 'Campus Member'}
                            </p>
                          </div>
                        </div>

                        {(req.note || req.message) && (
                          <div className="request-message-quote">
                            <span className="quote-label">Your message:</span>
                            <p className="quote-body">"{req.note || req.message}"</p>
                          </div>
                        )}

                        {/* STATUS SPECIFIC CONTACT REVEAL */}
                        {isAccepted && (
                          <div className="seller-contact-box" role="region" aria-label="Seller Contact">
                            <div className="contact-box-header">
                              <span className="contact-box-icon">🎉</span>
                              <div>
                                <h4 className="contact-box-title">Request Accepted by Seller!</h4>
                                <p className="contact-box-subtitle">
                                  Coordinate with the seller for campus meetup, physical check, and UPI handover:
                                </p>
                              </div>
                            </div>

                            <div className="contact-details-grid">
                              {/* Phone */}
                              <div className="contact-item">
                                <span className="contact-item-label">📞 Phone / WhatsApp:</span>
                                <div className="contact-item-value-row">
                                  <strong>
                                    {seller?.phone || 'Contact provided on profile'}
                                  </strong>
                                  {seller?.phone && (
                                    <>
                                      <a
                                        href={`tel:${seller.phone}`}
                                        className="btn btn-sm btn-outline"
                                      >
                                        Call
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(seller.phone, 'Phone number')}
                                        className="btn btn-sm btn-ghost"
                                        title="Copy phone"
                                      >
                                        📋 Copy
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Email */}
                              <div className="contact-item">
                                <span className="contact-item-label">✉️ College Email:</span>
                                <div className="contact-item-value-row">
                                  <strong>{seller?.email || 'Check campus directory'}</strong>
                                  {seller?.email && (
                                    <a
                                      href={`mailto:${seller.email}`}
                                      className="btn btn-sm btn-outline"
                                    >
                                      Email
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Department / Hostel */}
                              <div className="contact-item">
                                <span className="contact-item-label">🏢 Dept & Hostel:</span>
                                <strong>
                                  {seller?.department || seller?.hostel || 'Campus Grounds'}
                                </strong>
                              </div>
                            </div>
                          </div>
                        )}

                        {isPending && (
                          <div className="pending-status-banner">
                            <span>⏳</span>
                            <span>The seller has not reviewed your request yet. You will see contact details once accepted.</span>
                          </div>
                        )}

                        {isRejected && (
                          <div className="rejected-status-banner">
                            <span>✕</span>
                            <span>This request was declined by the seller. Feel free to explore other listings.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Requests;
