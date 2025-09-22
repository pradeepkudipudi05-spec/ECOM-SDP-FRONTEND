import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
import SellerProductCard from '../../components/SellerProductCard';
import apiClient from '../../api/apiClient';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // New message banner states
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products/my');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    const productName = product?.name || 'this product';
    
    if (!window.confirm(`Are you sure you want to delete "${productName}"?\n\nNote: Products that have been ordered by customers cannot be deleted.`)) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(`/products/${productId}`);
      setProducts(products.filter(product => product.id !== productId));
      // set success message
      setMessage('✅ Product deleted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      
      // Extract server message robustly
      let serverMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to delete product';

      // Keep older logic but use banner instead of alert
      if (error.response?.status === 409 || (typeof serverMessage === 'string' && serverMessage.toLowerCase().includes('foreign key'))) {
        serverMessage = 'Cannot delete this product because it has been ordered by customers. You can only delete products that have never been purchased.';
      } else if (error.response?.status === 403) {
        serverMessage = 'You do not have permission to delete this product. Only the product owner can delete it.';
      } else if (error.response?.status === 404) {
        serverMessage = 'Product not found. It may have already been deleted.';
      }

      setMessage(serverMessage);
      setMessageType('error');
    } finally {
      setDeleting(false);
      setTimeout(() => setMessage(''), 5000); // auto-hide
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading products..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProducts} />;
  }

  return (
    <div className="seller-page">
      <div className="seller-container">
        {/* Message banner */}
        {message && (
          <div
            className={`p-3 mb-4 rounded-xl text-center font-medium ${
              messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <div className="seller-header">
          <h1 className="seller-title">My Products</h1>
          <div className="seller-controls">
            <div className="seller-view-toggle">
              <button
                onClick={() => setViewMode('table')}
                className={`seller-toggle-btn ${viewMode === 'table' ? 'seller-toggle-active' : ''}`}
              >
                <svg className="seller-toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h4a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                </svg>
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`seller-toggle-btn ${viewMode === 'grid' ? 'seller-toggle-active' : ''}`}
              >
                <svg className="seller-toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </button>
            </div>
            <Link
              to="/seller/product/add"
              className="seller-btn seller-btn-primary"
            >
              <svg className="seller-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Product
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Start by adding your first product to your store"
            action={
              <Link
                to="/seller/product/add"
                className="seller-btn seller-btn-primary"
              >
                <svg className="seller-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Product
              </Link>
            }
          />
        ) : (
          <>
            {viewMode === 'table' ? (
              <div className="seller-table-container">
                <div className="seller-table-wrapper">
                  <table className="seller-table">
                    <thead className="seller-table-header">
                      <tr>
                        <th className="seller-table-th">Product</th>
                        <th className="seller-table-th">Category</th>
                        <th className="seller-table-th">Price</th>
                        <th className="seller-table-th">Stock</th>
                        <th className="seller-table-th">Status</th>
                        <th className="seller-table-th">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="seller-table-body">
                      {products.map((product) => (
                        <tr key={product.id} className="seller-table-row">
                          <td className="seller-table-td">
                            <div className="seller-product-info">
                              <img
                                src={product.imageUrl || '/api/placeholder/50/50'}
                                alt={product.name}
                                className="seller-product-image"
                              />
                              <div className="seller-product-details">
                                <div className="seller-product-name">{product.name}</div>
                                <div className="seller-product-description">{product.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="seller-table-td">
                            <span className="seller-category-name">{product.category?.name || 'No Category'}</span>
                          </td>
                          <td className="seller-table-td">
                            <span className="seller-product-price">${product.price}</span>
                          </td>
                          <td className="seller-table-td">
                            <span className="seller-stock-quantity">{product.stockQuantity || 0}</span>
                          </td>
                          <td className="seller-table-td">
                            <span className={`seller-status-badge ${product.stockQuantity > 0 ? 'seller-status-in-stock' : 'seller-status-out-of-stock'}`}>
                              {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="seller-table-td">
                            <div className="seller-actions">
                              <Link
                                to={`/seller/products/edit/${product.id}`}
                                className="seller-btn seller-btn-secondary seller-btn-sm"
                              >
                                <svg className="seller-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </Link>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                disabled={deleting}
                                className="seller-btn seller-btn-danger seller-btn-sm"
                                title="Delete product (may fail if product has been ordered)"
                              >
                                <svg className="seller-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="seller-grid-container">
                {products.map((product) => (
                  <SellerProductCard 
                    key={product.id} 
                    product={product} 
                    onDelete={deleteProduct}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
// import SellerProductCard from '../../components/SellerProductCard';
// import apiClient from '../../api/apiClient';

// const SellerProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [deleting, setDeleting] = useState(false);
//   const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const response = await apiClient.get('/products/my');
//       setProducts(response.data);
//     } catch (error) {
//       console.error('Failed to fetch products:', error);
//       setError('Failed to load products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteProduct = async (productId) => {
//     const product = products.find(p => p.id === productId);
//     const productName = product?.name || 'this product';
    
//     if (!window.confirm(`Are you sure you want to delete "${productName}"?\n\nNote: Products that have been ordered by customers cannot be deleted.`)) {
//       return;
//     }

//     setDeleting(true);
//     try {
//       await apiClient.delete(`/products/${productId}`);
//       setProducts(products.filter(product => product.id !== productId));
//       alert('Product deleted successfully!');
//     } catch (error) {
//       console.error('Failed to delete product:', error);
      
//       // Handle different types of errors
//       if (error.response?.status === 409 || error.response?.data?.message?.includes('foreign key')) {
//         alert('Cannot delete this product because it has been ordered by customers. You can only delete products that have never been purchased.');
//       } else if (error.response?.status === 403) {
//         alert('You do not have permission to delete this product. Only the product owner can delete it.');
//       } else if (error.response?.status === 404) {
//         alert('Product not found. It may have already been deleted.');
//       } else {
//         alert(`Failed to delete product: ${error.response?.data?.message || 'Unknown error'}`);
//       }
//     } finally {
//       setDeleting(false);
//     }
//   };

//   if (loading) {
//     return <LoadingSpinner size="large" text="Loading products..." />;
//   }

//   if (error) {
//     return <ErrorMessage message={error} onRetry={fetchProducts} />;
//   }

//   return (
//     <div className="seller-page">
//       <div className="seller-container">
//         <div className="seller-header">
//           <h1 className="seller-title">My Products</h1>
//           <div className="seller-controls">
//             <div className="seller-view-toggle">
//               <button
//                 onClick={() => setViewMode('table')}
//                 className={`seller-toggle-btn ${viewMode === 'table' ? 'seller-toggle-active' : ''}`}
//               >
//                 <svg className="seller-toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h4a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
//                 </svg>
//                 Table
//               </button>
//               <button
//                 onClick={() => setViewMode('grid')}
//                 className={`seller-toggle-btn ${viewMode === 'grid' ? 'seller-toggle-active' : ''}`}
//               >
//                 <svg className="seller-toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                 </svg>
//                 Grid
//               </button>
//             </div>
//             <Link
//               to="/seller/product/add"
//               className="seller-btn seller-btn-primary"
//             >
//               <svg className="seller-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//               </svg>
//               Add New Product
//             </Link>
//           </div>
//         </div>

//         {products.length === 0 ? (
//           <EmptyState
//             title="No products found"
//             description="Start by adding your first product to your store"
//             action={
//               <Link
//                 to="/seller/product/add"
//                 className="seller-btn seller-btn-primary"
//               >
//                 <svg className="seller-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                 </svg>
//                 Add Your First Product
//               </Link>
//             }
//           />
//         ) : (
//           <>
//             {viewMode === 'table' ? (
//               <div className="seller-table-container">
//                 <div className="seller-table-wrapper">
//                   <table className="seller-table">
//                     <thead className="seller-table-header">
//                       <tr>
//                         <th className="seller-table-th">Product</th>
//                         <th className="seller-table-th">Category</th>
//                         <th className="seller-table-th">Price</th>
//                         <th className="seller-table-th">Stock</th>
//                         <th className="seller-table-th">Status</th>
//                         <th className="seller-table-th">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="seller-table-body">
//                       {products.map((product) => (
//                         <tr key={product.id} className="seller-table-row">
//                           <td className="seller-table-td">
//                             <div className="seller-product-info">
//                               <img
//                                 src={product.imageUrl || '/api/placeholder/50/50'}
//                                 alt={product.name}
//                                 className="seller-product-image"
//                               />
//                               <div className="seller-product-details">
//                                 <div className="seller-product-name">{product.name}</div>
//                                 <div className="seller-product-description">{product.description}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="seller-table-td">
//                             <span className="seller-category-name">{product.category?.name || 'No Category'}</span>
//                           </td>
//                           <td className="seller-table-td">
//                             <span className="seller-product-price">${product.price}</span>
//                           </td>
//                           <td className="seller-table-td">
//                             <span className="seller-stock-quantity">{product.stockQuantity || 0}</span>
//                           </td>
//                           <td className="seller-table-td">
//                             <span className={`seller-status-badge ${product.stockQuantity > 0 ? 'seller-status-in-stock' : 'seller-status-out-of-stock'}`}>
//                               {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
//                             </span>
//                           </td>
//                           <td className="seller-table-td">
//                             <div className="seller-actions">
//                               <Link
//                                 to={`/seller/products/edit/${product.id}`}
//                                 className="seller-btn seller-btn-secondary seller-btn-sm"
//                               >
//                                 <svg className="seller-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                 </svg>
//                                 Edit
//                               </Link>
//                               <button
//                                 onClick={() => deleteProduct(product.id)}
//                                 disabled={deleting}
//                                 className="seller-btn seller-btn-danger seller-btn-sm"
//                                 title="Delete product (may fail if product has been ordered)"
//                               >
//                                 <svg className="seller-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                 </svg>
//                                 Delete
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             ) : (
//               <div className="seller-grid-container">
//                 {products.map((product) => (
//                   <SellerProductCard 
//                     key={product.id} 
//                     product={product} 
//                     onDelete={deleteProduct}
//                   />
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SellerProducts;
