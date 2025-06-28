import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OTPVerify() {
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const pendingLogin = JSON.parse(localStorage.getItem('pendingLogin'));

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');

    if (!pendingLogin) {
      setError('No pending login found.');
      return;
    }

    if (otpInput === pendingLogin.otp) {
      // Successful login
      localStorage.setItem('currentUser', JSON.stringify({
        email: pendingLogin.email,
        role: pendingLogin.role,
        isAuthenticated: true,
      }));

      localStorage.removeItem('pendingLogin');

      if (pendingLogin.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (pendingLogin.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (pendingLogin.role === 'executive') {
        navigate('/executive/dashboard'); 
      } else {
        setError('Invalid user role.');
      }
    } else {
      setError('Incorrect OTP. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleVerify} className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-6 text-center">Verify OTP</h1>

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-2 mb-4 border rounded"
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value)}
          required
        />

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Verify
        </button>
      </form>
    </div>
  );
}
