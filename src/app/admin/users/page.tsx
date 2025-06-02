'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { rtdb } from '@/lib/firebase';
import { ref, get, update, remove } from 'firebase/database';
import { withAdminProtection } from '@/contexts/AdminContext';
import { getRoleDisplayName } from '@/lib/permissions';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt?: string | number;
  lastLogin?: string | number;
  phone?: string;
  address?: string;
}

function UsersManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!rtdb) {
        setError('Firebase Realtime Database is not initialized');
        setLoading(false);
        return;
      }

      try {
        // Get registered users from users collection
        const usersRef = ref(rtdb, 'users');
        const snapshot = await get(usersRef);
        const usersData: UserData[] = [];

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            usersData.push({
              id: childSnapshot.key || '',
              email: userData.email || '',
              name: userData.name || userData.displayName || '',
              role: userData.role || 'user',
              createdAt: userData.createdAt || '',
              lastLogin: userData.lastLogin || '',
              phone: userData.phone || '',
              address: userData.address || '',
            });
          });
        }

        // Get anonymous visitors from analytics
        const visitorsRef = ref(rtdb, 'analytics/visitors');
        const visitorsSnapshot = await get(visitorsRef);

        if (visitorsSnapshot.exists()) {
          // Track unique session IDs that are not authenticated
          const anonymousSessionIds = new Set<string>();
          const authenticatedSessionIds = new Set<string>();

          // First, identify all authenticated sessions
          visitorsSnapshot.forEach((childSnapshot) => {
            const visitor = childSnapshot.val();
            if (visitor.isAuthenticated && visitor.sessionId) {
              authenticatedSessionIds.add(visitor.sessionId);
            }
          });

          // Then, find anonymous sessions
          visitorsSnapshot.forEach((childSnapshot) => {
            const visitor = childSnapshot.val();
            if (visitor.sessionId && !authenticatedSessionIds.has(visitor.sessionId) && !anonymousSessionIds.has(visitor.sessionId)) {
              anonymousSessionIds.add(visitor.sessionId);

              // Add as a "viewer" user
              usersData.push({
                id: `session_${visitor.sessionId}`,
                email: 'Anonymous Visitor',
                name: `Visitor ${anonymousSessionIds.size}`,
                role: 'viewer',
                createdAt: visitor.timestamp || '',
                lastLogin: visitor.timestamp || '',
                phone: '',
                address: visitor.location?.formattedAddress || '',
              });
            }
          });
        }

        // Sort by most recent first
        usersData.sort((a, b) => {
          const dateA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          const dateB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          return dateB - dateA;
        });

        setUsers(usersData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (user: UserData) => {
    // Can't edit anonymous visitors
    if (user.role === 'viewer' && user.id.startsWith('session_')) {
      alert('Cannot edit anonymous visitors');
      return;
    }

    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: UserData) => {
    // Can't delete anonymous visitors
    if (user.role === 'viewer' && user.id.startsWith('session_')) {
      alert('Cannot delete anonymous visitors');
      return;
    }

    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const saveUserChanges = async () => {
    if (!editingUser || !rtdb) return;

    try {
      const userRef = ref(rtdb, `users/${editingUser.id}`);
      await update(userRef, {
        name: editingUser.name,
        role: editingUser.role,
        phone: editingUser.phone,
        address: editingUser.address,
      });

      // Update local state
      setUsers(users.map(user =>
        user.id === editingUser.id ? { ...user, ...editingUser } : user
      ));

      setShowEditModal(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || !rtdb) return;

    try {
      const userRef = ref(rtdb, `users/${userToDelete.id}`);
      await remove(userRef);

      // Update local state
      setUsers(users.filter(user => user.id !== userToDelete.id));

      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email, name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="viewer">Viewers</option>
            <option value="user">Registered Users</option>
            <option value="editor">Editors</option>
            <option value="moderator">Moderators</option>
            <option value="admin">Admins</option>
            <option value="superadmin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-red-900 text-red-200' :
                        user.role === 'moderator' ? 'bg-yellow-900 text-yellow-200' :
                        user.role === 'editor' ? 'bg-green-900 text-green-200' :
                        'bg-blue-900 text-blue-200'
                      }`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.role === 'viewer' && user.id.startsWith('session_') ? (
                        <span className="text-gray-500">Anonymous</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>

            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input
                type="text"
                value={editingUser.email}
                disabled
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={editingUser.name || ''}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
              <input
                type="text"
                value={editingUser.phone || ''}
                onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">Address</label>
              <textarea
                value={editingUser.address || ''}
                onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveUserChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete the user <span className="font-semibold">{userToDelete.email}</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminProtection(UsersManagementPage);
