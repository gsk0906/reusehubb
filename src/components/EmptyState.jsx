import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = '📦',
  title = 'No items found',
  description = 'There are no items matching your criteria right now.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && (
        <div className="empty-state-action">
          {actionLink ? (
            <Link to={actionLink} className="btn btn-primary">
              {actionLabel}
            </Link>
          ) : (
            <button type="button" onClick={onAction} className="btn btn-primary">
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
