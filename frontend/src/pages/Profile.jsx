import React, { useState } from 'react';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update profile.');
      } else {
        setMessage('Profile updated successfully.');
        localStorage.setItem('user', JSON.stringify({ ...user, name }));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h2>Profile</h2>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: 500 }}>Username</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: 4 }}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: 500 }}>Current Password (required to change password)</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: 4 }}
            autoComplete="current-password"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: 500 }}>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: 4 }}
            autoComplete="new-password"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontWeight: 500 }}>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: 4 }}
            autoComplete="new-password"
          />
        </div>
        {error && <div style={{ color: '#e74c3c', marginBottom: 10 }}>{error}</div>}
        {message && <div style={{ color: '#27ae60', marginBottom: 10 }}>{message}</div>}
        <button type="submit" style={{ width: '100%', padding: '0.7rem', background: '#091C47', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
} 