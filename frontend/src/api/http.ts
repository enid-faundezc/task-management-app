// EFC: Instancia Base de Axios e Interceptor (/src/api/http.ts)Este módulo 
// centraliza todas las llamadas HTTP hacia tu backend (por defecto 
// configurado en http://localhost:3000). Su interceptor inyectará el token 
// dinámicamente directo desde el estado de Zustand antes de que cada 
// petición sea enviada [1].

import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const http = axios.create({
  // Lee la URL de la API desde las variables de Vite
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Petición (Inyecta JWT)
http.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// EFC NUEVO: Interceptor de Respuesta para Diagnóstico Crítico (Imprime en Logs)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🚨 [API ERROR LOG]:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      backendPayload: error.response?.data, // Aquí NestJS te dice exactamente qué falló (ej: DTO, DB)
      message: error.message,
    });
    return Promise.reject(error);
  }
);