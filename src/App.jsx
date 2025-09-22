import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

import { NavbarPublic, NavbarUser, NavbarSeller, NavbarAdmin } from "./components/Navbar";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Profile from "./pages/user/Profile";
import Cart from "./pages/user/Cart";
import Wishlist from "./pages/user/Wishlist";
import Orders from "./pages/user/Orders";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import AddEditProduct from "./pages/seller/AddEditProduct";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import ProductDetail from "./pages/public/ProductDetail";

function App() {
  const { user, loading } = useAuth();

  const renderNavbar = () => {
    if (loading) return <div>Loading...</div>;
    if (!user) return <NavbarPublic />;
    if (user.role === "USER") return <NavbarUser />;
    if (user.role === "SELLER") return <NavbarSeller />;
    if (user.role === "ADMIN") return <NavbarAdmin />;
    return <NavbarPublic />; // fallback
  };

  return (
    <>
      {renderNavbar()}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        {/* User Routes */}
        <Route
          path="/cart"
          element={
            <PrivateRoute allowedRoles={["USER"]}>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute allowedRoles={["USER"]}>
              <Wishlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute allowedRoles={["USER"]}>
              <Orders />
            </PrivateRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path="/seller/dashboard"
          element={
            <PrivateRoute allowedRoles={["SELLER"]}>
              <SellerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <PrivateRoute allowedRoles={["SELLER"]}>
              <SellerProducts />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/product/add"
          element={
            <PrivateRoute allowedRoles={["SELLER"]}>
              <AddEditProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/products/edit/:id"
          element={
            <PrivateRoute allowedRoles={["SELLER"]}>
              <AddEditProduct />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminProducts />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/product/add"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AddEditProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminCategories />
            </PrivateRoute>
          }
        />
        <Route
  path="/admin/products/edit/:id"
  element={
    <PrivateRoute allowedRoles={["ADMIN"]}>
      <AddEditProduct />
    </PrivateRoute>
  }
/>


        {/* Profile accessible for all logged-in roles */}
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={["USER", "SELLER", "ADMIN"]}>
              <Profile />
            </PrivateRoute>
          }
        />
        
      </Routes>
    </>
  );
}

export default App;
