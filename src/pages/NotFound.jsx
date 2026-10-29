import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon">🧭</div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          Looks like this campus corner doesn't exist or the listing was moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          ← Back to Campus Marketplace
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
