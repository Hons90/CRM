import axios from 'axios';

const API_URL = 'http://localhost:5050/api';

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Automatically add token if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Contacts
export const getContacts = () => api.get('/contacts');
export const uploadContactDocument = (id, formData) =>
  api.post(`/contacts/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Appointments
export const getAppointments = () => api.get('/appointments');

// Dashboard
export const getDashboardData = () => api.get('/dashboard');

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// fetch documents for a contact
export const getContactDocuments = (id) =>
  api.get(`/contacts/${id}/documents`);

export const getDialerPools = () => api.get('/dialer-pools');
export const createDialerPool = (poolName, file = null) => {
  const formData = new FormData();
  formData.append('pool_name', poolName);
  if (file) {
    formData.append('file', file);
  }
  return api.post('/dialer-pools', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const getPoolNumbers = (poolId) => api.get(`/dialer-pools/${poolId}/numbers`);

export const dialNumber = (poolId, phoneNumber) => 
  api.post('/calls/dial', { poolId, phoneNumber });
export const qualifyCall = (callId, data) => 
  api.post(`/calls/${callId}/qualify`, data);
export const getCallLogs = () => api.get('/calls/logs');

export const getCalendarEvents = () => api.get('/calendar/events');

export const deleteDialerPool = (poolId) => api.delete(`/dialer-pools/${poolId}`);

export const getAllUsers = () => api.get('/admin/users');
export const createUser = (userData) => api.post('/admin/users', userData);
export const updateUser = (userId, userData) => api.patch(`/admin/users/${userId}`, userData);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

export const createAppointment = (appointmentData) => api.post('/appointments', appointmentData);
export const updateAppointment = (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

export const refreshToken = (refreshToken) => 
  api.post('/auth/refresh', { refreshToken });
export const logout = () => api.post('/auth/logout');

export const createContact = (data) => api.post('/contacts', data);
export const updateContact = (id, data) => api.put(`/contacts/${id}`, data);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);

export default api;          