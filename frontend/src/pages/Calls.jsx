import React, { useState, useEffect } from 'react';
import { getDialerPools, getPoolNumbers, dialNumber, qualifyCall, getCallLogs } from '../api';
import './Calls.css';

export default function Calls() {
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPools();
    loadCallLogs();
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
      const response = await getPoolNumbers(poolId);
      setNumbers(response.data);
    } catch (err) {
      console.error('Error loading numbers:', err);
    }
  };

  const loadCallLogs = async () => {
    try {
      const response = await getCallLogs();
      setCallLogs(response.data);
    } catch (err) {
      console.error('Error loading call logs:', err);
    }
  };

  const handlePoolSelect = (pool) => {
    setSelectedPool(pool);
    loadNumbers(pool.id);
  };

  const handleDial = async (phoneNumber) => {
    setLoading(true);
    try {
      await dialNumber(selectedPool.id, phoneNumber);
      loadCallLogs();
      loadNumbers(selectedPool.id);
    } catch (err) {
      console.error('Error dialing:', err);
      alert('Failed to dial number');
    }
    setLoading(false);
  };

  const handleQualify = async (callId, status) => {
    try {
      await qualifyCall(callId, { status });
      loadCallLogs();
    } catch (err) {
      console.error('Error qualifying call:', err);
    }
  };

  return (
    <div className="calls-container">
      <h1>📞 Call Management</h1>
      
      <div className="calls-grid">
        <div className="pools-section">
          <h2>Dialer Pools</h2>
          <div className="pools-list">
            {pools.map(pool => (
              <div 
                key={pool.id} 
                className={`pool-card ${selectedPool?.id === pool.id ? 'selected' : ''}`}
                onClick={() => handlePoolSelect(pool)}
              >
                <h3>{pool.poolName}</h3>
                <p>Created: {new Date(pool.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="numbers-section">
          <h2>Numbers to Call</h2>
          {selectedPool ? (
            <div className="numbers-list">
              {numbers.map(number => (
                <div key={number.id} className="number-card">
                  <span className="phone-number">{number.phoneNumber}</span>
                  <span className={`status ${number.isCalled ? 'called' : 'pending'}`}>
                    {number.isCalled ? '✓ Called' : 'Pending'}
                  </span>
                  <button 
                    onClick={() => handleDial(number.phoneNumber)}
                    disabled={loading || number.isCalled}
                    className="dial-button"
                  >
                    📞 Dial
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>Select a dialer pool to view numbers</p>
          )}
        </div>

        <div className="logs-section">
          <h2>Recent Call Logs</h2>
          <div className="logs-list">
            {callLogs.map(log => (
              <div key={log.id} className="log-card">
                <div className="log-header">
                  <span className="phone">{log.phoneNumber}</span>
                  <span className="time">{new Date(log.callTime).toLocaleString()}</span>
                </div>
                <div className="log-status">
                  <span className={`status ${log.status}`}>{log.status}</span>
                  {log.status === 'initiated' && (
                    <div className="qualify-buttons">
                      <button onClick={() => handleQualify(log.id, 'completed')}>✓ Completed</button>
                      <button onClick={() => handleQualify(log.id, 'not_interested')}>✗ Not Interested</button>
                      <button onClick={() => handleQualify(log.id, 'interested')}>⭐ Interested</button>
                      <button onClick={() => handleQualify(log.id, 'other')}>📝 Other</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
