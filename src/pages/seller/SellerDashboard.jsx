import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner, ErrorMessage } from '../../components/UI';
import apiClient from '../../api/apiClient';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch seller's products
      const productsResponse = await apiClient.get('/products/my');
      const products = productsResponse.data;
      
      // Calculate stats
      const totalProducts = products.length;
      const lowStockProducts = products.filter(p => p.stockQuantity <= 5).length;
      
      // For now, we'll set orders and revenue to 0 since we don't have those endpoints yet
      setStats({
        totalProducts,
        totalOrders: 0,
        totalRevenue: 0,
        lowStockProducts
      });
      
      // Set recent products (last 5)
      setRecentProducts(products.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="seller-dashboard">
      <div className="seller-container">
        <div className="seller-header">
          <h1 className="seller-title">Seller Dashboard</h1>
          <p className="seller-subtitle">Manage your products and track your sales</p>
        </div>

        {/* Stats Cards */}
        <div className="seller-stats-grid">
          <div className="seller-stat-card seller-stat-card-blue">
            <div className="seller-stat-icon">
              <svg className="seller-stat-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="seller-stat-content">
              <div className="seller-stat-label">Total Products</div>
              <div className="seller-stat-value">{stats.totalProducts}</div>
            </div>
          </div>

          <div className="seller-stat-card seller-stat-card-green">
            <div className="seller-stat-icon">
              <svg className="seller-stat-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="seller-stat-content">
              <div className="seller-stat-label">Total Orders</div>
              <div className="seller-stat-value">{stats.totalOrders}</div>
            </div>
          </div>

          <div className="seller-stat-card seller-stat-card-yellow">
            <div className="seller-stat-icon">
              <svg className="seller-stat-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="seller-stat-content">
              <div className="seller-stat-label">Total Revenue</div>
              <div className="seller-stat-value">${stats.totalRevenue}</div>
            </div>
          </div>

          <div className="seller-stat-card seller-stat-card-red">
            <div className="seller-stat-icon">
              <svg className="seller-stat-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="seller-stat-content">
              <div className="seller-stat-label">Low Stock</div>
              <div className="seller-stat-value">{stats.lowStockProducts}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions and Recent Products */}
        <div className="seller-content-grid">
          <div className="seller-quick-actions-card">
            <div className="seller-card-header">
              <h2 className="seller-card-title">Quick Actions</h2>
              <p className="seller-card-subtitle">Manage your store efficiently</p>
            </div>
            <div className="seller-actions-list">
              <Link
                to="/seller/product/add"
                className="seller-action-btn seller-action-primary"
              >
                <svg className="seller-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Product
              </Link>
              <Link
                to="/seller/products"
                className="seller-action-btn seller-action-secondary"
              >
                <svg className="seller-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Manage Products
              </Link>
            </div>
          </div>

          <div className="seller-recent-products-card">
            <div className="seller-card-header">
              <h2 className="seller-card-title">Recent Products</h2>
              <p className="seller-card-subtitle">Your latest additions</p>
            </div>
            {recentProducts.length === 0 ? (
              <div className="seller-empty-state">
                <svg className="seller-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="seller-empty-text">No products yet. Add your first product!</p>
                <Link
                  to="/seller/product/add"
                  className="seller-empty-action"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="seller-products-list">
                {recentProducts.map((product) => (
                  <div key={product.id} className="seller-product-item">
                    <div className="seller-product-info">
                      <img
                        src={product.imageUrl || '/api/placeholder/40/40'}
                        alt={product.name}
                        className="seller-product-image"
                      />
                      <div className="seller-product-details">
                        <p className="seller-product-name">{product.name}</p>
                        <p className="seller-product-price">${product.price}</p>
                      </div>
                    </div>
                    <Link
                      to={`/seller/products/edit/${product.id}`}
                      className="seller-product-edit"
                    >
                      <svg className="seller-edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
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

export default SellerDashboard;
