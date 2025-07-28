import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user); // Pass user info to parent (App.jsx)
      setError('');
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Karus CRM Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        {error && <div style={{ color: '#e74c3c', marginBottom: '1rem', fontWeight: 500 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '0.5rem' }}>Login</button>
      </form>
    </div>
  );
} 