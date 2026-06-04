import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const http = axios.create({
  baseURL: 'http://localhost:3000',
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});