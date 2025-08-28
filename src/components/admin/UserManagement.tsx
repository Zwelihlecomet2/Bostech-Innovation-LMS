import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import UserForm from './UserForm';

export default function UserManagement() {
  const { state, dispatch, refreshData } = useApp();
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const users = state.users.filter(u => u.role === 'user');
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      setError(null);
      try {
        await apiService.deleteUser(userId);
        dispatch({ type: 'DELETE_USER', payload: userId });
        await refreshData();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleUserStatus = async (user: User) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.toggleUserStatus(user.id);
      dispatch({ type: 'UPDATE_USER', payload: result.user });
      await refreshData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const closeForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleUserSaved = async () => {
    await refreshData();
    closeForm();
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600 text-sm">Create and manage user accounts</p>
        </div>
        <button
          onClick={() => setShowUserForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No users match your search criteria.' : 'Get started by creating your first user.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowUserForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add First User
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user)}
                          disabled={loading}
                          className={`p-1 rounded hover:bg-gray-100 disabled:opacity-50 ${
                            user.isActive ? 'text-red-600' : 'text-green-600'
                          }`}
                          title={user.isActive ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          disabled={loading}
                          className="p-1 rounded hover:bg-gray-100 text-blue-600"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={loading}
                          className="p-1 rounded hover:bg-gray-100 text-red-600"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onClose={closeForm}
          onSave={handleUserSaved}
        />
      )}
    </div>
  );
}