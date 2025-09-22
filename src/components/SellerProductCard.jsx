import React from 'react';
import { Link } from 'react-router-dom';

const SellerProductCard = ({ product, onDelete }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.imageUrl || '/api/placeholder/300/200'}
          alt={product.name}
          className="product-image"
        />
      </Link>
      
      <div className="product-content">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-title">
            {product.name}
          </h3>
        </Link>
        
        <p className="product-description">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="product-price">
            ${product.price}
          </span>
          <span className="product-stock">
            Stock: {product.stockQuantity || 0}
          </span>
        </div>
        
        <div className="product-actions">
          <Link
            to={`/seller/products/edit/${product.id}`}
            className="btn btn-primary flex-1 text-center"
          >
            Edit
          </Link>
           <button
             onClick={() => onDelete && onDelete(product.id)}
             className="btn btn-danger flex-1"
             title="Delete product (may fail if product has been ordered)"
           >
             Delete
           </button>
        </div>
        <div className="mt-2">
          <span className="text-xs text-center px-2 py-1 bg-gray-100 rounded">
            {product.category?.name || 'No Category'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SellerProductCard;
