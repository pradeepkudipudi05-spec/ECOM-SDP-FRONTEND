import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
import apiClient from '../../api/apiClient';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const response = await apiClient.get('/wishlist');
      // Backend returns a Wishlist object with products array
      setWishlistItems(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch wishlist items:', error);
      setError('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setRemoving(true);
    try {
      await apiClient.delete(`/wishlist/remove?productId=${productId}`);
      setWishlistItems(wishlistItems.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      alert('Failed to remove item from wishlist');
    } finally {
      setRemoving(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await apiClient.post(`/cart/add?productId=${productId}&quantity=1`);
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading wishlist..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchWishlistItems} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

            {wishlistItems.length === 0 ? (
              <EmptyState
                title="Your wishlist is empty"
                description="Add products to your wishlist to save them for later"
                action={
                  <Link
                    to="/"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Browse Products
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.imageUrl || '/api/placeholder/300/200'}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-blue-600">
                          ${product.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          Stock: {product.stock}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addToCart(product.id)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          disabled={removing}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
