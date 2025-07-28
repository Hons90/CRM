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

export default api; 