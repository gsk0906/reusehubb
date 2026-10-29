import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', size = 'medium', inline = false }) => {
  return (
    <div className={`loading-wrapper ${inline ? 'inline' : 'block'}`} role="status">
      <div className={`spinner spinner-${size}`} aria-hidden="true"></div>
      {text && <span className="loading-text">{text}</span>}
      <span className="sr-only">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
