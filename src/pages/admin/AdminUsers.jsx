import React, { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
import apiClient from '../../api/apiClient';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'SELLER':
        return 'bg-green-100 text-green-800';
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'ALL') return true;
    return user.role === filter;
  });

  if (loading) {
    return <LoadingSpinner size="large" text="Loading users..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">User Management</h1>
          <div className="admin-controls">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Users</option>
              <option value="USER">Customers</option>
              <option value="SELLER">Sellers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No users match the current filter"
          />
        ) : (
          <div className="admin-table-container">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead className="admin-table-header">
                  <tr>
                    <th className="admin-table-th">User</th>
                    <th className="admin-table-th">Email</th>
                    <th className="admin-table-th">Role</th>
                    <th className="admin-table-th">Joined</th>
                    <th className="admin-table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="admin-table-body">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="admin-table-row">
                      <td className="admin-table-td">
                        <div className="user-info">
                          <div className="user-avatar">
                            <span className="user-avatar-text">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="user-details">
                            <div className="user-name">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="admin-table-td">
                        <span className="user-email">{user.email}</span>
                      </td>
                      <td className="admin-table-td">
                        <span className={`role-badge role-badge-${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="admin-table-td">
                        <span className="user-date">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="admin-table-td">
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={deleting || user.role === 'ADMIN'}
                          className="admin-btn admin-btn-danger"
                          title={user.role === 'ADMIN' ? 'Cannot delete admin users' : 'Delete user'}
                        >
                          <svg className="admin-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
