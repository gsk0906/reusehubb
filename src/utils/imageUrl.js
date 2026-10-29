/**
 * URL handling helpers for campus marketplace item images
 */

/**
 * Resolves an image source into a normalized, absolute URL.
 * - If src is an array, uses the first element.
 * - If it starts with http:// or https://, returns as is.
 * - If it starts with data:, returns as is.
 * - If it is a relative path (e.g., /uploads/x.jpg), prefixes it with the
 *   backend origin (VITE_API_URL without "/api").
 *
 * @param {string|string[]|null|undefined} src
 * @returns {string} Normalized image URL or empty string
 */
export const resolveImageUrl = (src) => {
  if (!src) return '';

  // If src is an array, use the first element
  let target = Array.isArray(src) ? src[0] : src;

  if (typeof target !== 'string') return '';
  target = target.trim();
  if (!target) return '';

  // Direct remote protocols or inline data URIs
  if (/^(https?:\/\/|data:)/i.test(target)) {
    return target;
  }

  // Relative path - prefix with backend origin (VITE_API_URL or current browser origin)
  const rawApiUrl = import.meta.env.VITE_API_URL || '';
  const backendOrigin = rawApiUrl
    ? rawApiUrl.replace(/\/api\/?$/i, '').replace(/\/+$/, '')
    : (typeof window !== 'undefined' ? window.location.origin : '');
  const relativePath = target.startsWith('/') ? target : `/${target}`;

  return backendOrigin ? `${backendOrigin}${relativePath}` : relativePath;
};
