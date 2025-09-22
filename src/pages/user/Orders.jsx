import React, { useState, useEffect } from "react";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../../components/UI";
import apiClient from "../../api/apiClient";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null); // store orderId while cancelling

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get("/orders/my");
      const data = response.data;
      const normalizedOrders = Array.isArray(data) ? data : [data];
      setOrders(normalizedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(orderId);
    try {
      await apiClient.put(`/orders/cancel/${orderId}`);
      alert("Order cancelled successfully!");
      await fetchOrders(); // refresh list after cancellation
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order");
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PLACED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading orders..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOrders} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

            {orders.length === 0 ? (
              <EmptyState
                title="No orders found"
                description="You haven't placed any orders yet"
                action={
                  <a
                    href="/"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Start Shopping
                  </a>
                }
              />
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${order.totalAmount?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Items:</h4>
                      {Array.isArray(order.items) &&
                        order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md"
                          >
                            <img
                              src={
                                item.product?.imageUrl ||
                                "/api/placeholder/60/60"
                              }
                              alt={item.product?.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {item.product?.name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                ${(item.priceAtPurchase * item.quantity).toFixed(
                                  2
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                ${item.priceAtPurchase} each
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Address */}
                    {order.shippingAddress && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Shipping Address:
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.street}
                          <br />
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}{" "}
                          {order.shippingAddress.zipCode}
                          <br />
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    )}

                    {/* Cancel Button (Only if status === PLACED) */}
                    {order.status === "PLACED" && (
                      <div className="mt-4">
                        <button
                          onClick={() => cancelOrder(order.id)}
                          disabled={cancelling === order.id}
                          className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50"
                        >
                          {cancelling === order.id
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      </div>
                    )}
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

export default Orders;




//best version

// import React, { useState, useEffect } from "react";
// import { LoadingSpinner, ErrorMessage, EmptyState } from "../../components/UI";
// import apiClient from "../../api/apiClient";

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await apiClient.get("/orders/my");

//       // Normalize: Ensure we always have an array
//       const data = response.data;
//       const normalizedOrders = Array.isArray(data) ? data : [data];

//       setOrders(normalizedOrders);
//     } catch (error) {
//       console.error("Failed to fetch orders:", error);
//       setError("Failed to load orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-800";
//       case "CONFIRMED":
//         return "bg-blue-100 text-blue-800";
//       case "SHIPPED":
//         return "bg-purple-100 text-purple-800";
//       case "DELIVERED":
//         return "bg-green-100 text-green-800";
//       case "CANCELLED":
//         return "bg-red-100 text-red-800";
//       case "PLACED": // ✅ Your backend sends PLACED
//         return "bg-orange-100 text-orange-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   if (loading) {
//     return <LoadingSpinner size="large" text="Loading orders..." />;
//   }

//   if (error) {
//     return <ErrorMessage message={error} onRetry={fetchOrders} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white shadow rounded-lg">
//           <div className="px-4 py-5 sm:p-6">
//             <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

//             {orders.length === 0 ? (
//               <EmptyState
//                 title="No orders found"
//                 description="You haven't placed any orders yet"
//                 action={
//                   <a
//                     href="/"
//                     className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
//                   >
//                     Start Shopping
//                   </a>
//                 }
//               />
//             ) : (
//               <div className="space-y-6">
//                 {orders.map((order) => (
//                   <div
//                     key={order.id}
//                     className="border border-gray-200 rounded-lg p-6"
//                   >
//                     {/* Header */}
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900">
//                           Order #{order.id}
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           Placed on {formatDate(order.createdAt)}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <span
//                           className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
//                             order.status
//                           )}`}
//                         >
//                           {order.status}
//                         </span>
//                         <p className="text-lg font-bold text-gray-900 mt-1">
//                           ${order.totalAmount?.toFixed(2)}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Items */}
//                     <div className="space-y-3">
//                       <h4 className="font-medium text-gray-900">Items:</h4>
//                       {Array.isArray(order.items) &&
//                         order.items.map((item) => (
//                           <div
//                             key={item.id}
//                             className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md"
//                           >
//                             <img
//                               src={
//                                 item.product?.imageUrl ||
//                                 "/api/placeholder/60/60"
//                               }
//                               alt={item.product?.name}
//                               className="w-12 h-12 object-cover rounded-md"
//                             />
//                             <div className="flex-1">
//                               <h5 className="font-medium text-gray-900">
//                                 {item.product?.name}
//                               </h5>
//                               <p className="text-sm text-gray-600">
//                                 Quantity: {item.quantity}
//                               </p>
//                             </div>
//                             <div className="text-right">
//                               <p className="font-medium text-gray-900">
//                                 ${(item.priceAtPurchase * item.quantity).toFixed(
//                                   2
//                                 )}
//                               </p>
//                               <p className="text-sm text-gray-600">
//                                 ${item.priceAtPurchase} each
//                               </p>
//                             </div>
//                           </div>
//                         ))}
//                     </div>

//                     {/* Address */}
//                     {order.shippingAddress && (
//                       <div className="mt-4 p-3 bg-gray-50 rounded-md">
//                         <h4 className="font-medium text-gray-900 mb-2">
//                           Shipping Address:
//                         </h4>
//                         <p className="text-sm text-gray-600">
//                           {order.shippingAddress.street}
//                           <br />
//                           {order.shippingAddress.city},{" "}
//                           {order.shippingAddress.state}{" "}
//                           {order.shippingAddress.zipCode}
//                           <br />
//                           {order.shippingAddress.country}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Orders;







// import React, { useState, useEffect } from 'react';
// import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
// import apiClient from '../../api/apiClient';

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await apiClient.get('/orders/my');
//       setOrders(response.data);
//     } catch (error) {
//       console.error('Failed to fetch orders:', error);
//       setError('Failed to load orders');
//     } finally {
//       setLoading(false);
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
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return <LoadingSpinner size="large" text="Loading orders..." />;
//   }

//   if (error) {
//     return <ErrorMessage message={error} onRetry={fetchOrders} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white shadow rounded-lg">
//           <div className="px-4 py-5 sm:p-6">
//             <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

//             {orders.length === 0 ? (
//               <EmptyState
//                 title="No orders found"
//                 description="You haven't placed any orders yet"
//                 action={
//                   <a
//                     href="/"
//                     className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
//                   >
//                     Start Shopping
//                   </a>
//                 }
//               />
//             ) : (
//               <div className="space-y-6">
//                 {orders.map((order) => (
//                   <div key={order.id} className="border border-gray-200 rounded-lg p-6">
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900">
//                           Order #{order.id}
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           Placed on {formatDate(order.orderDate)}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
//                           {order.status}
//                         </span>
//                         <p className="text-lg font-bold text-gray-900 mt-1">
//                           ${order.totalAmount.toFixed(2)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       <h4 className="font-medium text-gray-900">Items:</h4>
//                       {order.orderItems.map((item) => (
//                         <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
//                           <img
//                             src={item.product.imageUrl || '/api/placeholder/60/60'}
//                             alt={item.product.name}
//                             className="w-12 h-12 object-cover rounded-md"
//                           />
//                           <div className="flex-1">
//                             <h5 className="font-medium text-gray-900">{item.product.name}</h5>
//                             <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
//                           </div>
//                           <div className="text-right">
//                             <p className="font-medium text-gray-900">
//                               ${(item.product.price * item.quantity).toFixed(2)}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               ${item.product.price} each
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {order.shippingAddress && (
//                       <div className="mt-4 p-3 bg-gray-50 rounded-md">
//                         <h4 className="font-medium text-gray-900 mb-2">Shipping Address:</h4>
//                         <p className="text-sm text-gray-600">
//                           {order.shippingAddress.street}<br />
//                           {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
//                           {order.shippingAddress.country}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Orders;
