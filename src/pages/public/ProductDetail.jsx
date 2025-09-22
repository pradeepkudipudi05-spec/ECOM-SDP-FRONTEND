import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../../components/UI';
import apiClient from '../../api/apiClient';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProduct();
    if (user) {
      checkWishlist();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const response = await apiClient.get('/wishlist');
      const wishlistItems = response.data.map(item => item.product.id);
      setIsInWishlist(wishlistItems.includes(parseInt(id)));
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await apiClient.post(`/cart/add?productId=${id}&quantity=${quantity}`);
      setSuccess('Product added to cart successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await apiClient.delete(`/wishlist/remove?productId=${id}`);
        setIsInWishlist(false);
        setSuccess('Product removed from wishlist!');
      } else {
        await apiClient.post(`/wishlist/add?productId=${id}`);
        setIsInWishlist(true);
        setSuccess('Product added to wishlist!');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading product..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProduct} />;
  }

  if (!product) {
    return <ErrorMessage message="Product not found" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-w-16 aspect-h-12">
              <img
                src={product.imageUrl || '/api/placeholder/600/400'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{product.description}</p>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-blue-600">${product.price}</span>
                  <span className={`px-2 py-1 text-sm font-semibold rounded-full ${
                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Category: {product.category?.name || 'No Category'}</p>
                  <p>Seller: {product.seller?.name || 'Unknown'}</p>
                  <p>Stock: {product.stock} units</p>
                </div>
              </div>

              {success && <SuccessMessage message={success} />}

              {product.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                      Quantity:
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-0 focus:ring-0"
                        min="1"
                        max={product.stock}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
                    >
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={handleAddToWishlist}
                      disabled={addingToWishlist}
                      className={`px-6 py-3 rounded-md transition-colors duration-200 font-medium disabled:opacity-50 ${
                        isInWishlist
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {addingToWishlist ? 'Updating...' : (isInWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist')}
                    </button>
                  </div>
                </div>
              )}

              {product.stock === 0 && (
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-gray-600">This product is currently out of stock.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
