import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // If categories fail to load, continue without them
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded w-32 mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-surface rounded w-24"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
              !selectedCategory
                ? 'bg-primary-light text-primary'
                : 'text-secondary hover:bg-border-light'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary-light text-primary'
                  : 'text-secondary hover:bg-border-light'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const SearchBar = ({ onSearch, placeholder = "Search products..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="form-input pl-10 pr-10"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <svg className="w-5 h-5 text-muted hover:text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

const PriceFilter = ({ onPriceChange }) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleApply = () => {
    onPriceChange({
      min: minPrice ? parseFloat(minPrice) : null,
      max: maxPrice ? parseFloat(maxPrice) : null
    });
  };

  const handleClear = () => {
    setMinPrice('');
    setMaxPrice('');
    onPriceChange({ min: null, max: null });
  };

  return (
    <div className="card">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Price Range</h3>
        <div className="space-y-2">
          <div>
            <label className="form-label text-xs">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="form-input text-sm"
            />
          </div>
          <div>
            <label className="form-label text-xs">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="1000"
              className="form-input text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="btn btn-primary btn-sm flex-1"
            >
              Apply
            </button>
            <button
              onClick={handleClear}
              className="btn btn-secondary btn-sm flex-1"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CategoryFilter, SearchBar, PriceFilter };
