import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, doesUserExist, getUsers } from '../services/authService';
import '../styles/adminreg.css';


export default function AdminRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // ✅ Check if Admin already exists
  useEffect(() => {
    const users = getUsers();
    const adminExists = users.some(user => user.role === 'admin');
    if (adminExists) {
      alert('Admin already exists. Please login.');
      navigate('/login');
    }
  }, [navigate]);

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (doesUserExist(email)) {
      setError('User already exists with this email.');
      return;
    }

    const newAdmin = {
      email,
      password,
      role: 'admin', // Important!
    };

    registerUser(newAdmin);
    alert('Admin registered successfully!');
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Registration</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 mb-4 border rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Register
        </button>
      </form>
    </div>
  );
}
