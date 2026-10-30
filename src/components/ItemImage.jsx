import React, { useState, useEffect } from 'react';
import { resolveImageUrl } from '../utils/imageUrl';

// High-fidelity inline SVG Base64 fallback placeholder (avoids MIME/character encoding issues across all browsers)
export const LOCAL_FALLBACK_SVG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMzAwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YxZjVmOSIvPgogIDxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogICAgPHJlY3QgeD0iMTMwIiB5PSI4NSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIxMDUiIHJ4PSIxMCIgZmlsbD0iI2UyZThmMCIvPgogICAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTM4IiByPSIyOCIgZmlsbD0iI2NiZDVlMSIgc3Ryb2tlPSIjOTRhM2I4Ii8+CiAgICA8Y2lyY2xlIGN4PSIyNDIiIGN5PSIxMDgiIHI9IjQiIGZpbGw9IiM5NGEzYjgiLz4KICAgIDxwYXRoIGQ9Ik0xNjUgODUgTDE3NSA3MiBIMjI1IEwyMzUgODUgWiIgZmlsbD0iI2NiZDVlMSIvPgogIDwvZz4KICA8dGV4dCB4PSIyMDAiIHk9IjIyMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjNjQ3NDhiIj5DYW1wdXMgTWFya2V0cGxhY2UgSXRlbTwvdGV4dD4KICA8dGV4dCB4PSIyMDAiIHk9IjI0MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNTAwIiBmaWxsPSIjOTRhM2I4Ij5SZVVzZUh1YjwvdGV4dD4KPC9zdmc+';

/**
 * Reusable item image component with automatic URL resolution,
 * lazy-loading, and rock-solid fallback on failure.
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
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
};

export default ItemImage;
