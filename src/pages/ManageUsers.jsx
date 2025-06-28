import { useState, useEffect } from 'react';
import { getUsers, registerUser } from '../services/authService';
import '../styles/manageuser.css';
// Simple password generator function
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('worker');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [editingUserIndex, setEditingUserIndex] = useState(null);
  const [editingPassword, setEditingPassword] = useState('');

  // Fetch users when the page loads
  useEffect(() => {
    const usersData = getUsers();
    setUsers(usersData);
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    setError('');

    if (users.find(user => user.email === email)) {
      setError('User with this email already exists.');
      return;
    }

    const newPassword = generatePassword();

    const newUser = {
      email,
      role,
      password: newPassword,
    };

    registerUser(newUser);
    setUsers([...users, newUser]);
    setEmail('');
    setRole('worker');
    setPassword(newPassword);
  };

  const handleDeleteUser = (index) => {
    const updatedUsers = [...users];
    updatedUsers.splice(index, 1);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleEditUser = (index) => {
    setEditingUserIndex(index);
    setEditingPassword(users[index].password);
  };

  const handleSaveEdit = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].password = editingPassword;
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setEditingUserIndex(null);
    setEditingPassword('');
  };

  const handleCancelEdit = () => {
    setEditingUserIndex(null);
    setEditingPassword('');
  };

  return (
    <div className="manage-users-container">
      <h1>Manage Users</h1>

      {/* Add New User Form */}
      <form onSubmit={handleAddUser}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="worker">Worker</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="text"
            value={password || 'Password will be generated upon registration'}
            readOnly
          />
        </div>

        {error && <div className="error">{error}</div>}
        <button type="submit">Add User</button>
      </form>

      <h2>Existing Users</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            <strong>Email:</strong> {user.email} - 
            <strong>Role:</strong> {user.role} - 
            <strong>Password:</strong> 
            {editingUserIndex === index ? (
              <>
                <input
                  type="text"
                  value={editingPassword}
                  onChange={(e) => setEditingPassword(e.target.value)}
                  style={{ marginLeft: '10px' }}
                />
                <button onClick={() => handleSaveEdit(index)}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                {' '}{user.password}
                <button onClick={() => handleEditUser(index)} style={{ marginLeft: '10px' }}>Edit</button>
                <button onClick={() => handleDeleteUser(index)} style={{ marginLeft: '5px' }}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
