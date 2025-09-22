import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  isInWishlist,
  showActions = true,
}) => {
  return (
    <div className="product-card large">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.imageUrl || '/api/placeholder/300/200'}
          alt={product.name}
          className="product-image"
        />
      </Link>

      <div className="product-content">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>

        <p className="product-description">{product.description}</p>

        <div className="flex justify-between items-center mb-4">
          <span className="product-price">${product.price}</span>
          <span className="product-stock">
            Stock: {product.stockQuantity || 0}
          </span>
        </div>

        {showActions && (
          <div className="product-actions">
            <button
              onClick={() => onAddToCart(product.id)}
              className="btn btn-primary"
            >
              Add to Cart
            </button>
            <button
              onClick={() =>
                isInWishlist
                  ? onRemoveFromWishlist(product.id)
                  : onAddToWishlist(product.id)
              }
              className={`btn ${isInWishlist ? 'btn-danger' : 'btn-secondary'}`}
            >
              {isInWishlist ? 'Remove' : 'Wishlist'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
// import React from 'react';
// import { Link } from 'react-router-dom';

// const ProductCard = ({ product, onAddToCart, onAddToWishlist, onRemoveFromWishlist, isInWishlist, showActions = true }) => {
//   return (
//     <div className="product-card">
//       <Link to={`/product/${product.id}`}>
//         <img
//           src={product.imageUrl || '/api/placeholder/300/200'}
//           alt={product.name}
//           className="product-image"
//         />
//       </Link>
      
//       <div className="product-content">
//         <Link to={`/product/${product.id}`}>
//           <h3 className="product-title">
//             {product.name}
//           </h3>
//         </Link>
        
//         <p className="product-description">
//           {product.description}
//         </p>
        
//         <div className="flex justify-between items-center mb-4">
//           <span className="product-price">
//             ${product.price}
//           </span>
//           <span className="product-stock">
//             Stock: {product.stockQuantity || 0}
//           </span>
//         </div>
        
//         {showActions && (
//           <div className="product-actions">
//             <button
//               onClick={() => onAddToCart(product.id)}
//               className="btn btn-primary"
//             >
//               Add to Cart
//             </button>
//             <button
//               onClick={() => isInWishlist ? onRemoveFromWishlist(product.id) : onAddToWishlist(product.id)}
//               className={`btn ${isInWishlist ? 'btn-danger' : 'btn-secondary'}`}
//             >
//               {isInWishlist ? 'Remove' : 'Wishlist'}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductCard;
