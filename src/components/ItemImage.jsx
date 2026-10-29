import React, { useState, useEffect } from 'react';
import { resolveImageUrl } from '../utils/imageUrl';

// Local inline SVG data URI fallback placeholder to prevent external network failure
export const LOCAL_FALLBACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#f1f5f9"/>
  <g fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="130" y="85" width="140" height="105" rx="10" fill="#e2e8f0"/>
    <circle cx="200" cy="138" r="28" fill="#cbd5e1" stroke="#94a3b8"/>
    <circle cx="242" cy="108" r="4" fill="#94a3b8"/>
    <path d="M165 85 L175 72 H225 L235 85 Z" fill="#cbd5e1"/>
  </g>
  <text x="200" y="222" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#64748b">No Image Available</text>
  <text x="200" y="242" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" fill="#94a3b8">ReUseHub Campus Market</text>
</svg>
`)}`;

/**
 * Reusable item image component with automatic URL resolution,
 * lazy-loading, referrer policy protection, and infinite error loop guard.
 */
const ItemImage = ({ src, alt = 'Campus marketplace item', className = '', ...props }) => {
  const resolved = resolveImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolved || LOCAL_FALLBACK_SVG);
  const [hasError, setHasError] = useState(false);

  // Sync state whenever src prop changes
  useEffect(() => {
    const nextUrl = resolveImageUrl(src);
    setCurrentSrc(nextUrl || LOCAL_FALLBACK_SVG);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    // Guard against infinite onError loops
    if (!hasError && currentSrc !== LOCAL_FALLBACK_SVG) {
      setHasError(true);
      setCurrentSrc(LOCAL_FALLBACK_SVG);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
};

export default ItemImage;
