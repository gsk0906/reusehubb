import React from 'react';

/**
 * Reusable StatusBadge component
 * Supports:
 * - Item statuses: 'Available', 'Sold'
 * - Request statuses: 'Pending', 'Accepted', 'Rejected'
 * - Condition types: 'New', 'Like New', 'Good', 'Fair'
 */
const StatusBadge = ({ status = '', size = 'medium' }) => {
  const normalized = (status || '').toLowerCase().trim();

  let badgeClass = 'badge-default';
  let label = status || 'Unknown';
  let icon = '•';

  switch (normalized) {
    // Item Statuses
    case 'available':
      badgeClass = 'badge-available';
      label = 'Available';
      icon = '●';
      break;
    case 'sold':
      badgeClass = 'badge-sold';
      label = 'Sold';
      icon = '✓';
      break;

    // Request Statuses
    case 'pending':
      badgeClass = 'badge-pending';
      label = 'Pending';
      icon = '⏳';
      break;
    case 'accepted':
      badgeClass = 'badge-accepted';
      label = 'Accepted';
      icon = '✓';
      break;
    case 'rejected':
      badgeClass = 'badge-rejected';
      label = 'Rejected';
      icon = '✕';
      break;

    // Condition Badges
    case 'new':
      badgeClass = 'badge-condition-new';
      label = 'New';
      icon = '✨';
      break;
    case 'like new':
      badgeClass = 'badge-condition-likenew';
      label = 'Like New';
      icon = '★';
      break;
    case 'good':
      badgeClass = 'badge-condition-good';
      label = 'Good';
      icon = '👍';
      break;
    case 'fair':
      badgeClass = 'badge-condition-fair';
      label = 'Fair';
      icon = '⚖';
      break;

    default:
      badgeClass = 'badge-neutral';
      label = status;
      icon = '•';
      break;
  }

  return (
    <span className={`status-badge ${badgeClass} badge-${size}`} title={`Status: ${label}`}>
      <span className="badge-icon" aria-hidden="true">{icon}</span>
      <span className="badge-text">{label}</span>
    </span>
  );
};

export default StatusBadge;
