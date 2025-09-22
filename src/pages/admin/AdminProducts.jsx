import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
import apiClient from '../../api/apiClient';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // New states for message banner
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(`/products/${productId}`);
      setProducts(products.filter(product => product.id !== productId));
      // Use banner instead of alert
      setMessage('✅ Product deleted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      // Robust extraction of server message
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to delete product';
      setMessage(serverMessage);
      setMessageType('error');
    } finally {
      setDeleting(false);
      // Auto hide message after 5s
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading products..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProducts} />;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Message banner */}
        {message && (
          <div
            className={`p-3 mb-4 rounded-lg text-center font-medium ${
              messageType === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <div className="admin-header">
          <h1 className="admin-title">Product Management</h1>
          <Link
            to="/admin/product/add"
            className="admin-btn admin-btn-primary"
          >
            <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="No products have been added yet"
          />
        ) : (
          <div className="admin-table-container">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead className="admin-table-header">
                  <tr>
                    <th className="admin-table-th">Product</th>
                    <th className="admin-table-th">Seller</th>
                    <th className="admin-table-th">Category</th>
                    <th className="admin-table-th">Price</th>
                    <th className="admin-table-th">Stock</th>
                    <th className="admin-table-th">Status</th>
                    <th className="admin-table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="admin-table-body">
                  {products.map((product) => (
                    <tr key={product.id} className="admin-table-row">
                      <td className="admin-table-td">
                        <div className="product-info">
                          <img
                            src={product.imageUrl || '/api/placeholder/50/50'}
                            alt={product.name}
                            className="product-image"
                          />
                          <div className="product-details">
                            <div className="product-name">{product.name}</div>
                            <div className="product-description">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="admin-table-td">
                        <span className="seller-name">{product.seller?.name || 'Unknown'}</span>
                      </td>
                      <td className="admin-table-td">
                        <span className="category-name">{product.category?.name || 'No Category'}</span>
                      </td>
                      <td className="admin-table-td">
                        <span className="product-price">${product.price}</span>
                      </td>
                      <td className="admin-table-td">
                        <span className="stock-quantity">{product.stockQuantity}</span>
                      </td>
                      <td className="admin-table-td">
                        <span className={`status-badge ${product.stockQuantity > 0 ? 'status-in-stock' : 'status-out-of-stock'}`}>
                          {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="admin-table-td">
                        <div className="admin-actions">
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                          >
                            <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            disabled={deleting}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                          >
                            <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
// import apiClient from '../../api/apiClient';

// const AdminProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const response = await apiClient.get('/products');
//       setProducts(response.data);
//     } catch (error) {
//       console.error('Failed to fetch products:', error);
//       setError('Failed to load products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteProduct = async (productId) => {
//     if (!window.confirm('Are you sure you want to delete this product?')) {
//       return;
//     }

//     setDeleting(true);
//     try {
//       await apiClient.delete(`/products/${productId}`);
//       setProducts(products.filter(product => product.id !== productId));
//       alert('Product deleted successfully!');
//     } catch (error) {
//       console.error('Failed to delete product:', error);
//       alert('Failed to delete product');
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
//     <div className="admin-page">
//       <div className="admin-container">
//         <div className="admin-header">
//           <h1 className="admin-title">Product Management</h1>
//           <Link
//             to="/seller/product/add"
//             className="admin-btn admin-btn-primary"
//           >
//             <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//             </svg>
//             Add New Product
//           </Link>
//         </div>

//         {products.length === 0 ? (
//           <EmptyState
//             title="No products found"
//             description="No products have been added yet"
//           />
//         ) : (
//           <div className="admin-table-container">
//             <div className="admin-table-wrapper">
//               <table className="admin-table">
//                 <thead className="admin-table-header">
//                   <tr>
//                     <th className="admin-table-th">Product</th>
//                     <th className="admin-table-th">Seller</th>
//                     <th className="admin-table-th">Category</th>
//                     <th className="admin-table-th">Price</th>
//                     <th className="admin-table-th">Stock</th>
//                     <th className="admin-table-th">Status</th>
//                     <th className="admin-table-th">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="admin-table-body">
//                   {products.map((product) => (
//                     <tr key={product.id} className="admin-table-row">
//                       <td className="admin-table-td">
//                         <div className="product-info">
//                           <img
//                             src={product.imageUrl || '/api/placeholder/50/50'}
//                             alt={product.name}
//                             className="product-image"
//                           />
//                           <div className="product-details">
//                             <div className="product-name">{product.name}</div>
//                             <div className="product-description">{product.description}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="admin-table-td">
//                         <span className="seller-name">{product.seller?.name || 'Unknown'}</span>
//                       </td>
//                       <td className="admin-table-td">
//                         <span className="category-name">{product.category?.name || 'No Category'}</span>
//                       </td>
//                       <td className="admin-table-td">
//                         <span className="product-price">${product.price}</span>
//                       </td>
//                       <td className="admin-table-td">
//                         <span className="stock-quantity">{product.stockQuantity}</span>
//                       </td>
//                       <td className="admin-table-td">
//                         <span className={`status-badge ${product.stockQuantity > 0 ? 'status-in-stock' : 'status-out-of-stock'}`}>
//                           {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
//                         </span>
//                       </td>
//                       <td className="admin-table-td">
//                         <div className="admin-actions">
//                           <Link
//                             to={`/admin/products/edit/${product.id}`}
//                             className="admin-btn admin-btn-secondary admin-btn-sm"
//                           >
//                             <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                             </svg>
//                             Edit
//                           </Link>
//                           <button
//                             onClick={() => deleteProduct(product.id)}
//                             disabled={deleting}
//                             className="admin-btn admin-btn-danger admin-btn-sm"
//                           >
//                             <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                             </svg>
//                             Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminProducts;
