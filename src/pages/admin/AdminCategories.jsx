import React, { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorMessage, SuccessMessage, EmptyState } from '../../components/UI';
import apiClient from '../../api/apiClient';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.id}`, formData);
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...formData } : cat
        ));
        alert('Category updated successfully!');
      } else {
        const response = await apiClient.post('/categories', formData);
        setCategories([...categories, response.data]);
        alert('Category created successfully!');
      }
      
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save category:', error);
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await apiClient.delete(`/categories/${categoryId}`);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading categories..." />;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">Category Management</h1>

        <div className="categories-layout">
          {/* Add/Edit Category Form */}
          <div className="category-form-card">
            <div className="form-header">
              <h2 className="form-title">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="form-subtitle">
                {editingCategory ? 'Update category information' : 'Create a new product category'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter category name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Enter category description"
                />
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="form-actions">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="admin-btn admin-btn-secondary"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                >
                  <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="categories-list-card">
            <div className="list-header">
              <h2 className="list-title">Categories</h2>
              <p className="list-subtitle">Manage existing categories</p>
            </div>
            
            {categories.length === 0 ? (
              <EmptyState
                title="No categories found"
                description="Create your first category to organize products"
              />
            ) : (
              <div className="categories-list">
                {categories.map((category) => (
                  <div key={category.id} className="category-item">
                    <div className="category-content">
                      <h3 className="category-name">{category.name}</h3>
                      {category.description && (
                        <p className="category-description">{category.description}</p>
                      )}
                    </div>
                    <div className="category-actions">
                      <button
                        onClick={() => startEdit(category)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                      >
                        <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="admin-btn admin-btn-danger admin-btn-sm"
                      >
                        <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
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

export default AdminCategories;
