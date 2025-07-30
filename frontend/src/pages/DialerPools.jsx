import React, { useState, useEffect } from 'react';
import { getDialerPools, getPoolNumbers, deleteDialerPool } from '../api';
import './DialerPools.css';

export default function DialerPools() {
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [poolName, setPoolName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      const response = await getDialerPools();
      setPools(response.data);
    } catch (err) {
      console.error('Error loading pools:', err);
    }
  };

  const loadNumbers = async (poolId) => {
    try {
      setLoading(true);
      const response = await getPoolNumbers(poolId);
      setNumbers(response.data);
    } catch (err) {
      console.error('Error loading numbers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async (e) => {
    e.preventDefault();
    if (!poolName.trim()) return;

    try {
      setUploading(true);
      const response = await fetch('/api/dialer-pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ pool_name: poolName })
      });

      if (response.ok) {
        const newPool = await response.json();
        
        if (selectedFile) {
          await handleFileUpload(newPool.id);
        }
        
        setPoolName('');
        setSelectedFile(null);
        setShowCreateModal(false);
        loadPools();
      } else {
        alert('Failed to create pool');
      }
    } catch (err) {
      console.error('Error creating pool:', err);
      alert('Failed to create pool');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (poolId) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`/api/dialer-pools/${poolId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully imported ${result.message}`);
      } else {
        alert('Failed to upload file');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file');
    }
  };

  const handleDeletePool = async (poolId) => {
    if (!confirm('Are you sure you want to delete this pool?')) return;

    try {
      await deleteDialerPool(poolId);
      loadPools();
      if (selectedPool?.id === poolId) {
        setSelectedPool(null);
        setNumbers([]);
      }
    } catch (err) {
      console.error('Error deleting pool:', err);
      alert('Failed to delete pool');
    }
  };

  const handleViewNumbers = (pool) => {
    setSelectedPool(pool);
    loadNumbers(pool.id);
  };

  return (
    <div className="dialer-pools-container">
      <div className="page-header">
        <h1>📊 Dialer Pools Management</h1>
        <button 
          className="create-button"
          onClick={() => setShowCreateModal(true)}
        >
          + Create New Pool
        </button>
      </div>

      <div className="pools-grid">
        <div className="pools-section">
          <h2>All Dialer Pools</h2>
          <div className="pools-table">
            {pools.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Pool Name</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pools.map(pool => (
                    <tr key={pool.id}>
                      <td className="pool-name">{pool.poolName}</td>
                      <td>{new Date(pool.createdAt).toLocaleDateString()}</td>
                      <td className="actions">
                        <button 
                          className="view-button"
                          onClick={() => handleViewNumbers(pool)}
                        >
                          View Numbers
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeletePool(pool.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-pools">No dialer pools found. Create your first pool to get started.</p>
            )}
          </div>
        </div>

        {selectedPool && (
          <div className="numbers-section">
            <h2>Numbers in "{selectedPool.poolName}"</h2>
            {loading ? (
              <p>Loading numbers...</p>
            ) : (
              <div className="numbers-list">
                {numbers.length > 0 ? (
                  numbers.map(number => (
                    <div key={number.id} className="number-item">
                      <span className="phone">{number.phoneNumber}</span>
                      <span className={`status ${number.isCalled ? 'called' : 'pending'}`}>
                        {number.isCalled ? '✓ Called' : 'Pending'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No numbers in this pool.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Dialer Pool</h3>
              <button 
                className="close-button"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePool} className="modal-form">
              <div className="form-group">
                <label htmlFor="poolName">Pool Name</label>
                <input
                  id="poolName"
                  type="text"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  placeholder="Enter pool name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="file">Excel/CSV File (Optional)</label>
                <input
                  id="file"
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <small>Upload an Excel or CSV file with phone numbers</small>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={uploading}
                >
                  {uploading ? 'Creating...' : 'Create Pool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
