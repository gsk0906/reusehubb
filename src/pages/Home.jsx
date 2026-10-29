import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchItems } from '../api';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

// Primary campus categories
const CATEGORIES = [
  'All',
  'Textbooks',
  'Calculators',
  'Lab Equipment',
  'Drawing Instruments',
  'Hostel Essentials',
  'Electronics',
  'Other',
];

const CONDITIONS = ['All', 'New', 'Like New', 'Good', 'Fair'];

const SORT_OPTIONS = [
  { value: '', label: 'Default / Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Recently Listed' },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Extract query filters from URL
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const conditionParam = searchParams.get('condition') || 'All';
  const sortParam = searchParams.get('sort') || '';

  // Local state for search input
  const [searchInput, setSearchInput] = useState(searchParam);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Load items from API with active filters
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchParam.trim()) params.search = searchParam.trim();
      if (categoryParam && categoryParam !== 'All') params.category = categoryParam;
      if (conditionParam && conditionParam !== 'All') params.condition = conditionParam;
      if (sortParam) params.sort = sortParam;

      const data = await fetchItems(params);
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
    } catch (err) {
      const msg = err.friendlyMessage || 'Failed to load items from marketplace.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [searchParam, categoryParam, conditionParam, sortParam, toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    searchParam ||
    (categoryParam && categoryParam !== 'All') ||
    (conditionParam && conditionParam !== 'All') ||
    sortParam
  );

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-pill">
            <span>🌿 Campus Sustainability Marketplace</span>
          </div>
          <h1 className="hero-title">
            Pass On What You Don't Need. <br />
            <span className="hero-highlight">Pick Up What You Do.</span>
          </h1>
          <p className="hero-subtitle">
            Trade used semester textbooks, scientific calculators, mini drafters, lab coats, and hostel essentials
            directly with fellow students on campus. Save money, reduce campus waste.
          </p>

          {/* Search Box with Indian context examples */}
          <form onSubmit={handleSearchSubmit} className="hero-search-form" role="search">
            <div className="search-input-wrap">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search B.S. Grewal, Casio fx-991, Mini Drafter, Lab coat, Study lamp..."
                className="hero-search-input"
                aria-label="Search campus items"
              />
              {searchInput && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchInput('');
                    updateFilter('search', '');
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary search-submit-btn">
              Search
            </button>
          </form>

          {/* Quick Category Chips */}
          <div className="hero-category-chips">
            <span className="chips-label">Popular:</span>
            {['Textbooks', 'Calculators', 'Lab Equipment', 'Drawing Instruments', 'Hostel Essentials'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`chip-btn ${categoryParam === cat ? 'active' : ''}`}
                onClick={() => updateFilter('category', categoryParam === cat ? 'All' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Marketplace Area */}
      <main className="marketplace-section">
        <div className="marketplace-container">
          {/* Controls Bar: Filters & Sort */}
          <div className="controls-bar">
            {/* Category Select */}
            <div className="filter-group">
              <label htmlFor="cat-filter" className="filter-label">Category</label>
              <select
                id="cat-filter"
                value={categoryParam}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="select-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Select */}
            <div className="filter-group">
              <label htmlFor="cond-filter" className="filter-label">Condition</label>
              <select
                id="cond-filter"
                value={conditionParam}
                onChange={(e) => updateFilter('condition', e.target.value)}
                className="select-input"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond === 'All' ? 'All Conditions' : cond}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Sort */}
            <div className="filter-group">
              <label htmlFor="sort-filter" className="filter-label">Sort By</label>
              <select
                id="sort-filter"
                value={sortParam}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="select-input"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="filter-group reset-group">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn btn-outline btn-reset"
                >
                  ✕ Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="results-header">
            <h2 className="results-count">
              {loading ? (
                'Finding items...'
              ) : (
                <>
                  Showing <strong>{items.length}</strong> {items.length === 1 ? 'item' : 'items'}
                  {categoryParam !== 'All' && <span> in <em>{categoryParam}</em></span>}
                  {searchParam && <span> matching "<em>{searchParam}</em>"</span>}
                </>
              )}
            </h2>
            <Link to="/sell" className="btn btn-secondary btn-sm">
              + Post New Item
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="items-loading-container">
              <LoadingSpinner text="Loading campus marketplace items..." />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="error-container">
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <div>
                  <strong>Could not load items:</strong> {error}
                </div>
              </div>
              <button type="button" onClick={loadItems} className="btn btn-primary mt-3">
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && items.length === 0 && (
            <EmptyState
              icon="🔍"
              title="No items found"
              description={
                hasActiveFilters
                  ? "No listings match your current filters. Try searching for something else or clearing your filters."
                  : "No items have been listed on campus yet. Be the first student to post an item!"
              }
              actionLabel={hasActiveFilters ? "Reset Filters" : "Post an Item"}
              actionLink={hasActiveFilters ? undefined : "/sell"}
              onAction={hasActiveFilters ? handleClearFilters : undefined}
            />
          )}

          {/* Items Grid */}
          {!loading && !error && items.length > 0 && (
            <div className="items-grid">
              {items.map((item) => (
                <ItemCard key={item._id || item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
