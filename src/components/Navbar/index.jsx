import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const NavbarPublic = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="flex items-center">
          <Link to="/" className="navbar-brand">
            E-Commerce
          </Link>
        </div>
        <div className="navbar-nav">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </div>
    </nav>
  );
};

const NavbarUser = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="flex items-center">
          <Link to="/" className="navbar-brand">
            E-Commerce
          </Link>
        </div>
        <div className="navbar-nav">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/cart" className="navbar-link">Cart</Link>
          <Link to="/wishlist" className="navbar-link">Wishlist</Link>
          <Link to="/orders" className="navbar-link">Orders</Link>
          <div className="navbar-dropdown">
            <button className="navbar-link">
              {user?.name}
            </button>
            <div className="navbar-dropdown-menu">
              <Link to="/profile" className="navbar-dropdown-item">Profile</Link>
              <button onClick={logout} className="navbar-dropdown-item">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavbarSeller = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="flex items-center">
          <Link to="/" className="navbar-brand">
            E-Commerce
          </Link>
        </div>
        <div className="navbar-nav">
          <Link to="/seller/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/seller/products" className="navbar-link">My Products</Link>
          <Link to="/seller/product/add" className="navbar-link">Add Product</Link>
          <div className="navbar-dropdown">
            <button className="navbar-link">
              {user?.name}
            </button>
            <div className="navbar-dropdown-menu">
              <Link to="/profile" className="navbar-dropdown-item">Profile</Link>
              <button onClick={logout} className="navbar-dropdown-item">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavbarAdmin = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="flex items-center">
          <Link to="/" className="navbar-brand">
            E-Commerce
          </Link>
        </div>
        <div className="navbar-nav">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/admin/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/admin/users" className="navbar-link">Users</Link>
          <Link to="/admin/products" className="navbar-link">Products</Link>
          <Link to="/admin/orders" className="navbar-link">Orders</Link>
          <Link to="/admin/categories" className="navbar-link">Categories</Link>
          <div className="navbar-dropdown">
            <button className="navbar-link">
              {user?.name}
            </button>
            <div className="navbar-dropdown-menu">
              <Link to="/profile" className="navbar-dropdown-item">Profile</Link>
              <button onClick={logout} className="navbar-dropdown-item">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { NavbarPublic, NavbarUser, NavbarSeller, NavbarAdmin };