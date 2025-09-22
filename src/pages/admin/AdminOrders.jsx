import React, { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
import apiClient from '../../api/apiClient';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [statusSelections, setStatusSelections] = useState({}); // <-- stores selected status per order

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/orders/all');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!newStatus) {
      alert('Please select a status first.');
      return;
    }
    setUpdating(true);
    try {
      const res = await apiClient.put(`/orders/status/${orderId}?status=${newStatus}`);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? res.data : order))
      );
      alert('Order status updated successfully!');
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === 'ALL') return true;
    return order.status === filter;
  });

  // UI States
  if (loading) return <LoadingSpinner size="large" text="Loading orders..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOrders} />;

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header + Filter */}
        <div className="admin-header">
          <h1 className="admin-title">Order Management</h1>
          <div className="admin-controls">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* No Orders */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="No orders match the current filter"
          />
        ) : (
          <div className="orders-container">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                {/* Order Header */}
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-title">Order #{order.id}</h3>
                    <p className="order-customer">
                      Customer: {order.customer?.name} ({order.customer?.email})
                    </p>
                    <p className="order-date">
                      Ordered on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="order-status-section">
                    <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                      {order.status || 'UNKNOWN'}
                    </span>
                    <p className="order-total">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="order-items">
                  <h4 className="order-items-title">Items:</h4>
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <div className="items-list">
                      {order.items.map((item) => (
                        <div key={item.id} className="order-item">
                          <img
                            src={item.product?.imageUrl || '/api/placeholder/60/60'}
                            alt={item.product?.name || 'No name'}
                            className="item-image"
                          />
                          <div className="item-details">
                            <h5 className="item-name">
                              {item.product?.name || 'Unknown Product'}
                            </h5>
                            <p className="item-quantity">Quantity: {item.quantity}</p>
                            <p className="item-seller">
                              Seller: {item.product?.seller?.name || 'Unknown'}
                            </p>
                          </div>
                          <div className="item-pricing">
                            <p className="item-total">
                              ${(item.priceAtPurchase * item.quantity || 0).toFixed(2)}
                            </p>
                            <p className="item-unit-price">
                              ${item.priceAtPurchase || 0} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-items">No items for this order</p>
                  )}
                </div>

                {/* Status Management */}
                <div className="status-management">
                  <div className="status-controls">
                    <select
                      value={statusSelections[order.id] || ''}
                      onChange={(e) =>
                        setStatusSelections((prev) => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                      className="status-select"
                    >
                      <option value="">Select Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, statusSelections[order.id])
                      }
                      disabled={updating || !statusSelections[order.id]}
                      className="admin-btn admin-btn-primary status-update-btn"
                    >
                      <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
// import React, { useState, useEffect } from 'react';
// import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
// import apiClient from '../../api/apiClient';

// const AdminOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [updating, setUpdating] = useState(false);
//   const [filter, setFilter] = useState('ALL');

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // Fetch all orders
//   const fetchOrders = async () => {
//     try {
//       const response = await apiClient.get('/orders/all');
//       setOrders(response.data || []);
//     } catch (err) {
//       console.error('Failed to fetch orders:', err);
//       setError('Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update order status
//   const updateOrderStatus = async (orderId, newStatus) => {
//     setUpdating(true);
//     try {
//       const res = await apiClient.put(`/orders/status/${orderId}?status=${newStatus}`);
//       // Replace the updated order in local state
//       setOrders((prev) =>
//         prev.map((order) => (order.id === orderId ? res.data : order))
//       );
//       alert('Order status updated successfully!');
//     } catch (err) {
//       console.error('Failed to update order status:', err);
//       alert('Failed to update order status');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // Status badge colors
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'PENDING':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'CONFIRMED':
//         return 'bg-blue-100 text-blue-800';
//       case 'SHIPPED':
//         return 'bg-purple-100 text-purple-800';
//       case 'DELIVERED':
//         return 'bg-green-100 text-green-800';
//       case 'CANCELLED':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return 'Unknown date';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   // Filter orders
//   const filteredOrders = orders.filter((order) => {
//     if (filter === 'ALL') return true;
//     return order.status === filter;
//   });

//   // UI States
//   if (loading) {
//     return <LoadingSpinner size="large" text="Loading orders..." />;
//   }

//   if (error) {
//     return <ErrorMessage message={error} onRetry={fetchOrders} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header + Filter */}
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
//           <select
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="ALL">All Orders</option>
//             <option value="PENDING">Pending</option>
//             <option value="CONFIRMED">Confirmed</option>
//             <option value="SHIPPED">Shipped</option>
//             <option value="DELIVERED">Delivered</option>
//             <option value="CANCELLED">Cancelled</option>
//           </select>
//         </div>

//         {/* No Orders */}
//         {filteredOrders.length === 0 ? (
//           <EmptyState
//             title="No orders found"
//             description="No orders match the current filter"
//           />
//         ) : (
//           <div className="space-y-6">
//             {filteredOrders.map((order) => (
//               <div
//                 key={order.id}
//                 className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
//               >
//                 {/* Order Header */}
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       Order #{order.id}
//                     </h3>
//                     <p className="text-sm text-gray-600">
//                       Customer: {order.customer?.name} ({order.customer?.email})
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Ordered on {formatDate(order.createdAt)}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span
//                       className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
//                         order.status
//                       )}`}
//                     >
//                       {order.status || 'UNKNOWN'}
//                     </span>
//                     <p className="text-lg font-bold text-gray-900 mt-1">
//                       ${order.totalAmount?.toFixed(2) || '0.00'}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Items */}
//                 <div className="space-y-3 mb-4">
//                   <h4 className="font-medium text-gray-900">Items:</h4>
//                   {Array.isArray(order.items) && order.items.length > 0 ? (
//                     order.items.map((item) => (
//                       <div
//                         key={item.id}
//                         className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md"
//                       >
//                         <img
//                           src={item.product?.imageUrl || '/api/placeholder/60/60'}
//                           alt={item.product?.name || 'No name'}
//                           className="w-12 h-12 object-cover rounded-md"
//                         />
//                         <div className="flex-1">
//                           <h5 className="font-medium text-gray-900">
//                             {item.product?.name || 'Unknown Product'}
//                           </h5>
//                           <p className="text-sm text-gray-600">
//                             Quantity: {item.quantity}
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             Seller: {item.product?.seller?.name || 'Unknown'}
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <p className="font-medium text-gray-900">
//                             ${(item.priceAtPurchase * item.quantity || 0).toFixed(2)}
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             ${item.priceAtPurchase || 0} each
//                           </p>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-sm text-gray-500">No items for this order</p>
//                   )}
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-end space-x-2">
//                   {order.status === 'PENDING' && (
//                     <>
//                       <button
//                         onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
//                         disabled={updating}
//                         className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
//                       >
//                         Confirm
//                       </button>
//                       <button
//                         onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
//                         disabled={updating}
//                         className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   )}
//                   {order.status === 'CONFIRMED' && (
//                     <button
//                       onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
//                       disabled={updating}
//                       className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
//                     >
//                       Mark as Shipped
//                     </button>
//                   )}
//                   {order.status === 'SHIPPED' && (
//                     <button
//                       onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
//                       disabled={updating}
//                       className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
//                     >
//                       Mark as Delivered
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminOrders;





// import React, { useState, useEffect } from 'react';
// import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
// import apiClient from '../../api/apiClient';

// const AdminOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [updating, setUpdating] = useState(false);
//   const [filter, setFilter] = useState('ALL');

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await apiClient.get('/orders/all');
//       console.log("Orders response:", response.data);
//       setOrders(response.data || []);
//     } catch (error) {
//       console.error('Failed to fetch orders:', error);
//       setError('Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateOrderStatus = async (orderId, newStatus) => {
//     setUpdating(true);
//     try {
//       await apiClient.put(`/orders/status/${orderId}?status=${newStatus}`);
//       setOrders(orders.map(order =>
//         order.id === orderId ? { ...order, status: newStatus } : order
//       ));
//       alert('Order status updated successfully!');
//     } catch (error) {
//       console.error('Failed to update order status:', error);
//       alert('Failed to update order status');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'PENDING':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'CONFIRMED':
//         return 'bg-blue-100 text-blue-800';
//       case 'SHIPPED':
//         return 'bg-purple-100 text-purple-800';
//       case 'DELIVERED':
//         return 'bg-green-100 text-green-800';
//       case 'CANCELLED':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "Unknown date";
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const filteredOrders = orders.filter(order => {
//     if (filter === 'ALL') return true;
//     return order.status === filter;
//   });

//   if (loading) {
//     return <LoadingSpinner size="large" text="Loading orders..." />;
//   }

//   if (error) {
//     return <ErrorMessage message={error} onRetry={fetchOrders} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
//           <div className="flex space-x-4">
//             <select
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="ALL">All Orders</option>
//               <option value="PENDING">Pending</option>
//               <option value="CONFIRMED">Confirmed</option>
//               <option value="SHIPPED">Shipped</option>
//               <option value="DELIVERED">Delivered</option>
//               <option value="CANCELLED">Cancelled</option>
//             </select>
//           </div>
//         </div>

//         {filteredOrders.length === 0 ? (
//           <EmptyState
//             title="No orders found"
//             description="No orders match the current filter"
//           />
//         ) : (
//           <div className="space-y-6">
//             {filteredOrders.map((order) => (
//               <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       Order #{order.id}
//                     </h3>
//                     <p className="text-sm text-gray-600">
//                       Customer: {order.customer?.name} ({order.customer?.email})
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Ordered on {formatDate(order.createdAt)}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
//                       {order.status || 'UNKNOWN'}
//                     </span>
//                     <p className="text-lg font-bold text-gray-900 mt-1">
//                       ${order.totalAmount?.toFixed(2) || '0.00'}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-3 mb-4">
//                   <h4 className="font-medium text-gray-900">Items:</h4>
//                   {Array.isArray(order.items) && order.items.length > 0 ? (
//                     order.items.map((item) => (
//                       <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
//                         <img
//                           src={item.product?.imageUrl || '/api/placeholder/60/60'}
//                           alt={item.product?.name || 'No name'}
//                           className="w-12 h-12 object-cover rounded-md"
//                         />
//                         <div className="flex-1">
//                           <h5 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h5>
//                           <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
//                           <p className="text-sm text-gray-600">Seller: {item.product?.seller?.name || 'Unknown'}</p>
//                         </div>
//                         <div className="text-right">
//                           <p className="font-medium text-gray-900">
//                             ${(item.priceAtPurchase * item.quantity || 0).toFixed(2)}
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             ${item.priceAtPurchase || 0} each
//                           </p>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-sm text-gray-500">No items for this order</p>
//                   )}
//                 </div>

//                 <div className="flex justify-end space-x-2">
//                   {order.status === 'PENDING' && (
//                     <>
//                       <button
//                         onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
//                         disabled={updating}
//                         className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
//                       >
//                         Confirm
//                       </button>
//                       <button
//                         onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
//                         disabled={updating}
//                         className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   )}
//                   {order.status === 'CONFIRMED' && (
//                     <button
//                       onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
//                       disabled={updating}
//                       className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
//                     >
//                       Mark as Shipped
//                     </button>
//                   )}
//                   {order.status === 'SHIPPED' && (
//                     <button
//                       onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
//                       disabled={updating}
//                       className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
//                     >
//                       Mark as Delivered
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminOrders;
















// import React, { useState, useEffect } from 'react';
// import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
// import apiClient from '../../api/apiClient';

// const AdminOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [updating, setUpdating] = useState(false);
//   const [filter, setFilter] = useState('ALL');

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await apiClient.get('/orders/all');
//       setOrders(response.data);
//     } catch (error) {
//       console.error('Failed to fetch orders:', error);
//       setError('Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateOrderStatus = async (orderId, newStatus) => {
//     setUpdating(true);
//     try {
//       await apiClient.put(`/orders/status/${orderId}?status=${newStatus}`);
//       setOrders(orders.map(order => 
//         order.id === orderId ? { ...order, status: newStatus } : order
//       ));
//       alert('Order status updated successfully!');
//     } catch (error) {
//       console.error('Failed to update order status:', error);
//       alert('Failed to update order status');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'PENDING':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'CONFIRMED':
//         return 'bg-blue-100 text-blue-800';
//       case 'SHIPPED':
//         return 'bg-purple-100 text-purple-800';
//       case 'DELIVERED':
//         return 'bg-green-100 text-green-800';
//       case 'CANCELLED':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const filteredOrders = orders.filter(order => {
//     if (filter === 'ALL') return true;
//     return order.status === filter;
//   });

//   if (loading) {
//     return <LoadingSpinner size="large" text="Loading orders..." />;
//   }

//   if (error) {
//     return <ErrorMessage message={error} onRetry={fetchOrders} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
//           <div className="flex space-x-4">
//             <select
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="ALL">All Orders</option>
//               <option value="PENDING">Pending</option>
//               <option value="CONFIRMED">Confirmed</option>
//               <option value="SHIPPED">Shipped</option>
//               <option value="DELIVERED">Delivered</option>
//               <option value="CANCELLED">Cancelled</option>
//             </select>
//           </div>
//         </div>

//         {filteredOrders.length === 0 ? (
//           <EmptyState
//             title="No orders found"
//             description="No orders match the current filter"
//           />
//         ) : (
//           <div className="space-y-6">
//             {filteredOrders.map((order) => (
//               <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       Order #{order.id}
//                     </h3>
//                     <p className="text-sm text-gray-600">
//                       Customer: {order.user?.name || 'Unknown'}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Placed on {formatDate(order.orderDate)}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
//                       {order.status}
//                     </span>
//                     <p className="text-lg font-bold text-gray-900 mt-1">
//                       ${order.totalAmount.toFixed(2)}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-3 mb-4">
//                   <h4 className="font-medium text-gray-900">Items:</h4>
//                   {order.orderItems.map((item) => (
//                     <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
//                       <img
//                         src={item.product.imageUrl || '/api/placeholder/60/60'}
//                         alt={item.product.name}
//                         className="w-12 h-12 object-cover rounded-md"
//                       />
//                       <div className="flex-1">
//                         <h5 className="font-medium text-gray-900">{item.product.name}</h5>
//                         <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
//                         <p className="text-sm text-gray-600">Seller: {item.product.seller?.name || 'Unknown'}</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-medium text-gray-900">
//                           ${(item.product.price * item.quantity).toFixed(2)}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           ${item.product.price} each
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {order.shippingAddress && (
//                   <div className="mb-4 p-3 bg-gray-50 rounded-md">
//                     <h4 className="font-medium text-gray-900 mb-2">Shipping Address:</h4>
//                     <p className="text-sm text-gray-600">
//                       {order.shippingAddress.street}<br />
//                       {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
//                       {order.shippingAddress.country}
//                     </p>
//                   </div>
//                 )}

//                 <div className="flex justify-end space-x-2">
//                   {order.status === 'PENDING' && (
//                     <>
//                       <button
//                         onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
//                         disabled={updating}
//                         className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
//                       >
//                         Confirm
//                       </button>
//                       <button
//                         onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
//                         disabled={updating}
//                         className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   )}
//                   {order.status === 'CONFIRMED' && (
//                     <button
//                       onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
//                       disabled={updating}
//                       className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
//                     >
//                       Mark as Shipped
//                     </button>
//                   )}
//                   {order.status === 'SHIPPED' && (
//                     <button
//                       onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
//                       disabled={updating}
//                       className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
//                     >
//                       Mark as Delivered
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminOrders;
