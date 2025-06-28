import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findUserByEmailPassword } from '../services/authService';
import { generateOTP } from '../utils/otpGenerator';
import { sendOTPEmail } from '../services/emailService';
import '../styles/login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const user = findUserByEmailPassword(email, password);

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    const otp = generateOTP();

    localStorage.setItem('pendingLogin', JSON.stringify({
      email: user.email,
      role: user.role,
      otp: otp,
    }));

    try {
      await sendOTPEmail(user.email, otp);
      alert('OTP has been sent to your email!');
      navigate('/verify-otp');
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP. Try again.');
    }
  };

  return (
    <div className="login-container">
  <form onSubmit={handleLogin} className="login-form">
    <h1>Login</h1>

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    {error && <div className="error-message">{error}</div>}

    <button type="submit">Login</button>
  </form>
</div>
  
  );
}
