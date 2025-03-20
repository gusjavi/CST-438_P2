import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', isAdmin: false });
    const [editUser, setEditUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        // Check if user is admin
        const checkAdmin = async () => {
            try {
                const response = await fetch('/api/auth/checkAdmin', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (!response.ok) {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                navigate('/');
            }
        };

        checkAdmin();
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/admin/users?username=${newUser.username}&password=${newUser.password}&isAdmin=${newUser.isAdmin}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (response.ok) {
                setNewUser({ username: '', password: '', isAdmin: false });
                fetchUsers();
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/admin/users?username=${editUser.originalUsername}&newUsername=${editUser.username}&newPassword=${editUser.password}&isAdmin=${editUser.isAdmin}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (response.ok) {
                setEditUser(null);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteUser = async (username) => {
        try {
            const response = await fetch(`/api/admin/users?username=${username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (response.ok) {
                setDeleteConfirm(null);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <section className="user-management">
                <h2>User Management</h2>

                <div className="create-user">
                    <h3>Create New User</h3>
                    <form onSubmit={handleCreateUser}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            required
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={newUser.isAdmin}
                                onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                            />
                            Admin
                        </label>
                        <button type="submit">Create User</button>
                    </form>
                </div>

                <div className="users-list">
                    <h3>All Users</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Username</th>
                            <th>Admin</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.admin ? 'Yes' : 'No'}</td>
                                <td>
                                    <button onClick={() => setEditUser({...user, originalUsername: user.username})}>Edit</button>
                                    <button onClick={() => setDeleteConfirm(user.username)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {editUser && (
                    <div className="edit-user-modal">
                        <div className="modal-content">
                            <h3>Edit User</h3>
                            <form onSubmit={handleUpdateUser}>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={editUser.username}
                                    onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="New Password (leave blank to keep current)"
                                    value={editUser.password || ''}
                                    onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                                />
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={editUser.admin}
                                        onChange={(e) => setEditUser({...editUser, isAdmin: e.target.checked})}
                                    />
                                    Admin
                                </label>
                                <div className="button-group">
                                    <button type="submit">Update</button>
                                    <button type="button" onClick={() => setEditUser(null)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {deleteConfirm && (
                    <div className="delete-confirm-modal">
                        <div className="modal-content">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete user "{deleteConfirm}"?</p>
                            <div className="button-group">
                                <button onClick={() => handleDeleteUser(deleteConfirm)}>Delete</button>
                                <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default AdminDashboard;