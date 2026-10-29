/**
 * Reusable formatting helpers for Indian campus marketplace context
 */

/**
 * Format price in Indian Rupees (₹)
 * Example: 450 -> "₹450"
 */
export const formatPrice = (price) => {
  const numeric = typeof price === 'number' ? price : Number(price) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
};
