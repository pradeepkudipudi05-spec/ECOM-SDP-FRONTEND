import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import ProductCard from '../../components/ProductCard';
import { CategoryFilter, SearchBar, PriceFilter } from '../../components/Filters';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
import apiClient from '../../api/apiClient';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceFilter, setPriceFilter] = useState({ min: null, max: null });
  const [wishlist, setWishlist] = useState([]);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, priceFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/products';
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append('keyword', searchTerm);
      }
      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }
      if (priceFilter.min !== null) {
        params.append('min', priceFilter.min);
      }
      if (priceFilter.max !== null) {
        params.append('max', priceFilter.max);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await apiClient.get('/wishlist');
      // Backend returns a Wishlist object with products array
      const wishlistItems = response.data.products ? response.data.products.map(product => product.id) : [];
      setWishlist(wishlistItems);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setWishlist([]); // Set empty array on error
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await apiClient.post(`/cart/add?productId=${productId}&quantity=1`);
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      await apiClient.post(`/wishlist/add?productId=${productId}`);
      setWishlist([...wishlist, productId]);
      alert('Product added to wishlist!');
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      alert('Failed to add product to wishlist');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await apiClient.delete(`/wishlist/remove?productId=${productId}`);
      setWishlist(wishlist.filter(id => id !== productId));
      alert('Product removed from wishlist!');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      alert('Failed to remove product from wishlist');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handlePriceChange = (priceRange) => {
    setPriceFilter(priceRange);
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading products..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProducts} />;
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to E-Commerce
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Discover amazing products at great prices
          </p>
          <div className="max-w-md mx-auto">
            <SearchBar onSearch={handleSearch} placeholder="Search for products..." />
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Temporarily Hidden */}
          {/* <div className="lg:w-1/5">
            <div className="space-y-4">
              <CategoryFilter 
                selectedCategory={selectedCategory} 
                onCategoryChange={handleCategoryChange} 
              />
              <PriceFilter onPriceChange={handlePriceChange} />
            </div>
          </div> */}

          {/* Products Grid */}
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2">
                {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
              </h2>
              <p className="text-secondary">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try adjusting your search or filter criteria"
                action={
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory(null);
                      setPriceFilter({ min: null, max: null });
                    }}
                    className="btn btn-primary"
                  >
                    Clear Filters
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                    isInWishlist={wishlist.includes(product.id)}
                    showActions={!!user}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
