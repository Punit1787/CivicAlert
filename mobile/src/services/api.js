// mobile/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
const BASE_URL = __DEV__
  ? 'http://10.148.138.88:5050'
  : 'https://api.civicalert.in';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export async function loginWithGoogle(idToken) {
  const { data } = await api.post('/auth/google', { idToken });
  if (data.token) {
    await AsyncStorage.setItem('auth_token', data.token);
  }
  return data;
}

export async function loginWithEmail(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  if (data.token) {
    await AsyncStorage.setItem('auth_token', data.token);
  }
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function logout() {
  await AsyncStorage.removeItem('auth_token');
}

// ── Reports ─────────────────────────────────────────────────────────────────
export async function submitReport(formData) {
  const { data } = await api.post('/report/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

export async function verifyImage(formData) {
  const { data } = await api.post('/report/verify-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

export async function getUserReports() {
  const { data } = await api.get('/reports');
  return data.reports || [];
}

export default api;
