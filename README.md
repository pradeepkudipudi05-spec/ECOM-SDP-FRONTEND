# E-Commerce Frontend

A modern, responsive React frontend for an e-commerce application with role-based access control.

## Features

### 🎯 **Role-Based Access Control**
- **Public Users**: Browse products, view product details, login/register
- **Customers (USER)**: Add to cart, wishlist, place orders, manage profile
- **Sellers (SELLER)**: Manage products, view dashboard, track sales
- **Admins (ADMIN)**: Full system management, user/product/order management

### 🛍️ **Core E-Commerce Features**
- Product browsing with search and filtering
- Shopping cart functionality
- Wishlist management
- Order placement and tracking
- User profile management
- Product management (for sellers)
- Category management (for admins)

### 🎨 **Modern UI/UX**
- Clean, responsive design with Tailwind CSS
- Smooth animations and transitions
- Mobile-first approach
- Loading states and error handling
- Intuitive navigation

## Tech Stack

- **React 19** - Frontend framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management for authentication

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:2000`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create `.env` file in the root directory:
   ```
   VITE_API_BASE_URL=http://localhost:2000/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── auth/                 # Authentication context and private routes
├── api/                  # API client configuration
├── components/           # Reusable UI components
│   ├── Navbar/          # Navigation components for different roles
│   ├── ProductCard.jsx  # Product display component
│   ├── Filters.jsx      # Search and filter components
│   └── UI.jsx           # Common UI components (loading, error, etc.)
├── pages/               # Page components
│   ├── public/          # Public pages (Home, Login, Register, ProductDetail)
│   ├── user/            # User-specific pages (Profile, Cart, Wishlist, Orders)
│   ├── seller/          # Seller pages (Dashboard, Products, AddEditProduct)
│   └── admin/           # Admin pages (Dashboard, Users, Products, Orders, Categories)
└── App.jsx              # Main application component with routing
```

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /users/register` - User registration

### Products
- `GET /products` - Get all products
- `GET /products/{id}` - Get product by ID
- `GET /products/search` - Search products
- `GET /products/category/{id}` - Get products by category
- `POST /products/add` - Add new product (Seller/Admin)
- `PUT /products/{id}` - Update product (Seller/Admin)
- `DELETE /products/{id}` - Delete product (Seller/Admin)

### Cart & Wishlist
- `GET /cart` - Get user cart
- `POST /cart/add` - Add to cart
- `DELETE /cart/remove/{id}` - Remove from cart
- `GET /wishlist` - Get user wishlist
- `POST /wishlist/add` - Add to wishlist
- `DELETE /wishlist/remove` - Remove from wishlist

### Orders
- `POST /orders/place` - Place order
- `GET /orders/my` - Get user orders
- `GET /orders/all` - Get all orders (Admin)
- `PUT /orders/status/{id}` - Update order status (Admin)

### Users & Categories
- `GET /users` - Get all users (Admin)
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user (Admin)
- `GET /categories` - Get all categories
- `POST /categories` - Add category (Admin)
- `PUT /categories/{id}` - Update category (Admin)
- `DELETE /categories/{id}` - Delete category (Admin)

## Key Features Explained

### 🔐 **Authentication Flow**
- JWT token-based authentication
- Automatic token refresh
- Protected routes based on user roles
- Persistent login state

### 🛒 **Shopping Experience**
- Browse products with search and category filters
- Add products to cart with quantity selection
- Save products to wishlist
- Place orders with shipping address
- Track order status

### 👨‍💼 **Seller Dashboard**
- View sales statistics
- Manage product inventory
- Add/edit/delete products
- Track orders

### 👑 **Admin Panel**
- Complete system overview
- Manage users, products, and orders
- Category management
- Order status updates

## Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Error Handling

- Comprehensive error handling for API calls
- User-friendly error messages
- Loading states for better UX
- Retry mechanisms for failed requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.