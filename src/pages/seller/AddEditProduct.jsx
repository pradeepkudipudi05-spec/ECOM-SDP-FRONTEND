import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingSpinner, ErrorMessage, SuccessMessage } from "../../components/UI";
import apiClient from "../../api/apiClient";

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    categoryId: "",
    sellerId: "" // ✅ Added sellerId
  });

  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]); // ✅ Store sellers list
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // ✅ Track if admin

  useEffect(() => {
    checkAdmin(); // ✅ Determine if logged-in user is admin
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [id]);

  // ✅ Check if logged-in user is ADMIN using localStorage
  const checkAdmin = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "ADMIN") {
        setIsAdmin(true);
        fetchSellers();
      }
    } catch (error) {
      console.error("Failed to check user role:", error);
    }
  };

  // ✅ Fetch sellers by filtering from /api/users
  const fetchSellers = async () => {
    try {
      const response = await apiClient.get("/users");
      const sellerList = response.data.filter((u) => u.role === "SELLER");
      setSellers(sellerList);
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stockQuantity?.toString() || "",
        imageUrl: product.imageUrl || "",
        categoryId: product.category?.id || "",
        sellerId: product.seller?.id || "" // ✅ Pre-fill sellerId if editing
      });
    } catch (error) {
      console.error("Failed to fetch product:", error);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stock),
        imageUrl: formData.imageUrl
      };

      let url;
      if (isEdit) {
        url = `/products/${id}?categoryId=${formData.categoryId}`;
        if (isAdmin && formData.sellerId) {
          url += `&sellerId=${formData.sellerId}`; // ✅ Pass sellerId for admin
        }
        await apiClient.put(url, productData);
        setSuccess("Product updated successfully!");
      } else {
        url = `/products/add?categoryId=${formData.categoryId}`;
        if (isAdmin && formData.sellerId) {
          url += `&sellerId=${formData.sellerId}`; // ✅ Pass sellerId for admin
        }
        await apiClient.post(url, productData);
        setSuccess("Product created successfully!");
      }

      setTimeout(() => {
        navigate(isAdmin ? "/admin/products" : "/seller/products");
      }, 1500);
    } catch (error) {
      console.error("Failed to save product:", error);
      setError(error.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary mb-6">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="form-label">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="form-label">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="form-label">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    id="stock"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="categoryId" className="form-label">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    id="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ✅ Show Seller Dropdown only for ADMIN */}
                {isAdmin && (
                  <div>
                    <label htmlFor="sellerId" className="form-label">
                      Assign to Seller
                    </label>
                    <select
                      name="sellerId"
                      id="sellerId"
                      required
                      value={formData.sellerId}
                      onChange={handleChange}
                      className="form-input form-select"
                    >
                      <option value="">Select a seller</option>
                      {sellers.map((seller) => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name} ({seller.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="imageUrl" className="form-label">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                  <img
                    src={formData.imageUrl}
                    alt="Product preview"
                    className="h-32 w-32 object-cover rounded-md border border-gray-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(isAdmin ? "/admin/products" : "/seller/products")}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? <LoadingSpinner size="small" text="" /> : isEdit ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditProduct;
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../../components/UI';
// import apiClient from '../../api/apiClient';

// const AddEditProduct = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEdit = !!id;

//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     stock: '',
//     imageUrl: '',
//     categoryId: '',
//     sellerId: '' // ✅ NEW FIELD
//   });

//   const [categories, setCategories] = useState([]);
//   const [sellers, setSellers] = useState([]); // ✅ NEW STATE
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [isAdmin, setIsAdmin] = useState(false); // ✅ Detect admin

//   useEffect(() => {
//     fetchCategories();
//     checkAdmin();
//     if (isEdit) {
//       fetchProduct();
//     } else {
//       setLoading(false);
//     }
//   }, [id]);

//   const checkAdmin = () => {
//   try {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user?.role === "ADMIN") {
//       setIsAdmin(true);
//       fetchSellers(); // Load sellers only for admin
//     }
//   } catch (error) {
//     console.error("Failed to check user role:", error);
//   }
// };

//   const fetchCategories = async () => {
//     try {
//       const response = await apiClient.get('/categories');
//       setCategories(response.data);
//     } catch (error) {
//       console.error('Failed to fetch categories:', error);
//     }
//   };

//   const fetchSellers = async () => {
//     try {
//       const response = await apiClient.get('/users/sellers'); // ✅ Make sure this endpoint returns sellers
//       setSellers(response.data);
//     } catch (error) {
//       console.error('Failed to fetch sellers:', error);
//     }
//   };

//   const fetchProduct = async () => {
//     try {
//       const response = await apiClient.get(`/products/${id}`);
//       const product = response.data;
//       setFormData({
//         name: product.name || '',
//         description: product.description || '',
//         price: product.price?.toString() || '',
//         stock: product.stockQuantity?.toString() || '',
//         imageUrl: product.imageUrl || '',
//         categoryId: product.category?.id || '',
//         sellerId: product.seller?.id || '' // ✅ populate seller for edit
//       });
//     } catch (error) {
//       console.error('Failed to fetch product:', error);
//       setError('Failed to load product details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError('');
//     setSuccess('');

//     try {
//       const productData = {
//         name: formData.name,
//         description: formData.description,
//         price: parseFloat(formData.price),
//         stockQuantity: parseInt(formData.stock),
//         imageUrl: formData.imageUrl,
//         sellerId: isAdmin ? formData.sellerId : undefined // ✅ Only send if admin
//       };

//       if (isEdit) {
//         await apiClient.put(`/products/${id}?categoryId=${formData.categoryId}`, productData);
//         setSuccess('Product updated successfully!');
//       } else {
//         const url = isAdmin
//           ? `/products/add?categoryId=${formData.categoryId}&sellerId=${formData.sellerId}`
//           : `/products/add?categoryId=${formData.categoryId}`;
//         await apiClient.post(url, productData);
//         setSuccess('Product created successfully!');
//       }

//       setTimeout(() => {
//         navigate('/seller/products');
//       }, 1500);
//     } catch (error) {
//       console.error('Failed to save product:', error);
//       setError(error.response?.data?.message || 'Failed to save product');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <LoadingSpinner size="large" text="Loading..." />;
//   }

//   return (
//     <div className="min-h-screen bg-surface py-8">
//       <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="card">
//           <div className="p-6">
//             <h1 className="text-2xl font-bold text-primary mb-6">
//               {isEdit ? 'Edit Product' : 'Add New Product'}
//             </h1>
            
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                 <div className="sm:col-span-2">
//                   <label htmlFor="name" className="form-label">
//                     Product Name
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     id="name"
//                     required
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="Enter product name"
//                   />
//                 </div>

//                 <div className="sm:col-span-2">
//                   <label htmlFor="description" className="form-label">
//                     Description
//                   </label>
//                   <textarea
//                     name="description"
//                     id="description"
//                     rows={4}
//                     required
//                     value={formData.description}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="Enter product description"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="price" className="form-label">
//                     Price ($)
//                   </label>
//                   <input
//                     type="number"
//                     name="price"
//                     id="price"
//                     step="0.01"
//                     min="0"
//                     required
//                     value={formData.price}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="0.00"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="stock" className="form-label">
//                     Stock Quantity
//                   </label>
//                   <input
//                     type="number"
//                     name="stock"
//                     id="stock"
//                     min="0"
//                     required
//                     value={formData.stock}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="0"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="categoryId" className="form-label">
//                     Category
//                   </label>
//                   <select
//                     name="categoryId"
//                     id="categoryId"
//                     required
//                     value={formData.categoryId}
//                     onChange={handleChange}
//                     className="form-input form-select"
//                   >
//                     <option value="">Select a category</option>
//                     {categories.map((category) => (
//                       <option key={category.id} value={category.id}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* ✅ Only visible if logged-in user is admin */}
//                 {isAdmin && (
//                   <div>
//                     <label htmlFor="sellerId" className="form-label">
//                       Assign to Seller
//                     </label>
//                     <select
//                       name="sellerId"
//                       id="sellerId"
//                       required
//                       value={formData.sellerId}
//                       onChange={handleChange}
//                       className="form-input form-select"
//                     >
//                       <option value="">Select a seller</option>
//                       {sellers.map((seller) => (
//                         <option key={seller.id} value={seller.id}>
//                           {seller.name} ({seller.email})
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 <div className="sm:col-span-2">
//                   <label htmlFor="imageUrl" className="form-label">
//                     Image URL
//                   </label>
//                   <input
//                     type="url"
//                     name="imageUrl"
//                     id="imageUrl"
//                     value={formData.imageUrl}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="https://example.com/image.jpg"
//                   />
//                 </div>
//               </div>

//               {formData.imageUrl && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
//                   <img
//                     src={formData.imageUrl}
//                     alt="Product preview"
//                     className="h-32 w-32 object-cover rounded-md border border-gray-300"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                     }}
//                   />
//                 </div>
//               )}

//               {error && <ErrorMessage message={error} />}
//               {success && <SuccessMessage message={success} />}

//               <div className="flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => navigate('/seller/products')}
//                   className="btn btn-secondary"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="btn btn-primary"
//                 >
//                   {saving ? (
//                     <LoadingSpinner size="small" text="" />
//                   ) : (
//                     isEdit ? 'Update Product' : 'Create Product'
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddEditProduct;






// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../../components/UI';
// import apiClient from '../../api/apiClient';

// const AddEditProduct = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEdit = !!id;

//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     stock: '',
//     imageUrl: '',
//     categoryId: ''
//   });
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     fetchCategories();
//     if (isEdit) {
//       fetchProduct();
//     } else {
//       setLoading(false);
//     }
//   }, [id]);

//   const fetchCategories = async () => {
//     try {
//       const response = await apiClient.get('/categories');
//       setCategories(response.data);
//     } catch (error) {
//       console.error('Failed to fetch categories:', error);
//     }
//   };

//   const fetchProduct = async () => {
//     try {
//       const response = await apiClient.get(`/products/${id}`);
//       const product = response.data;
//       setFormData({
//         name: product.name || '',
//         description: product.description || '',
//         price: product.price?.toString() || '',
//         stock: product.stockQuantity?.toString() || '',
//         imageUrl: product.imageUrl || '',
//         categoryId: product.category?.id || ''
//       });
//     } catch (error) {
//       console.error('Failed to fetch product:', error);
//       setError('Failed to load product details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError('');
//     setSuccess('');

//     try {
//       const productData = {
//         name: formData.name,
//         description: formData.description,
//         price: parseFloat(formData.price),
//         stockQuantity: parseInt(formData.stock),
//         imageUrl: formData.imageUrl
//       };

//       if (isEdit) {
//         await apiClient.put(`/products/${id}?categoryId=${formData.categoryId}`, productData);
//         setSuccess('Product updated successfully!');
//       } else {
//         await apiClient.post(`/products/add?categoryId=${formData.categoryId}`, productData);
//         setSuccess('Product created successfully!');
//       }

//       setTimeout(() => {
//         navigate('/seller/products');
//       }, 1500);
//     } catch (error) {
//       console.error('Failed to save product:', error);
//       setError(error.response?.data?.message || 'Failed to save product');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <LoadingSpinner size="large" text="Loading..." />;
//   }

//   return (
//     <div className="min-h-screen bg-surface py-8">
//       <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="card">
//           <div className="p-6">
//             <h1 className="text-2xl font-bold text-primary mb-6">
//               {isEdit ? 'Edit Product' : 'Add New Product'}
//             </h1>
            
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                 <div className="sm:col-span-2">
//                   <label htmlFor="name" className="form-label">
//                     Product Name
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     id="name"
//                     required
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="Enter product name"
//                   />
//                 </div>

//                 <div className="sm:col-span-2">
//                   <label htmlFor="description" className="form-label">
//                     Description
//                   </label>
//                   <textarea
//                     name="description"
//                     id="description"
//                     rows={4}
//                     required
//                     value={formData.description}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="Enter product description"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="price" className="form-label">
//                     Price ($)
//                   </label>
//                   <input
//                     type="number"
//                     name="price"
//                     id="price"
//                     step="0.01"
//                     min="0"
//                     required
//                     value={formData.price}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="0.00"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="stock" className="form-label">
//                     Stock Quantity
//                   </label>
//                   <input
//                     type="number"
//                     name="stock"
//                     id="stock"
//                     min="0"
//                     required
//                     value={formData.stock}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="0"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="categoryId" className="form-label">
//                     Category
//                   </label>
//                   <select
//                     name="categoryId"
//                     id="categoryId"
//                     required
//                     value={formData.categoryId}
//                     onChange={handleChange}
//                     className="form-input form-select"
//                   >
//                     <option value="">Select a category</option>
//                     {categories.map((category) => (
//                       <option key={category.id} value={category.id}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="sm:col-span-2">
//                   <label htmlFor="imageUrl" className="form-label">
//                     Image URL
//                   </label>
//                   <input
//                     type="url"
//                     name="imageUrl"
//                     id="imageUrl"
//                     value={formData.imageUrl}
//                     onChange={handleChange}
//                     className="form-input"
//                     placeholder="https://example.com/image.jpg"
//                   />
//                 </div>
//               </div>

//               {formData.imageUrl && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
//                   <img
//                     src={formData.imageUrl}
//                     alt="Product preview"
//                     className="h-32 w-32 object-cover rounded-md border border-gray-300"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                     }}
//                   />
//                 </div>
//               )}

//               {error && <ErrorMessage message={error} />}
//               {success && <SuccessMessage message={success} />}

//               <div className="flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => navigate('/seller/products')}
//                   className="btn btn-secondary"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="btn btn-primary"
//                 >
//                   {saving ? (
//                     <LoadingSpinner size="small" text="" />
//                   ) : (
//                     isEdit ? 'Update Product' : 'Create Product'
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddEditProduct;
