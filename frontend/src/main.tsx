// EFC: Inicialización de Keycloak y Punto de Entrada,
// Se usa la estrategia:  Autenticación por Bloqueo de Montaje: 
// la aplicación de React no se cargará en el navegador hasta que Keycloak confirme 
// que el usuario ha iniciado sesión con éxito y posea un token JWT válido.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Keycloak from 'keycloak-js';
import { useAuthStore } from './store/auth.store';
import { TasksDashboard } from './pages/TasksDashboard';

// Cliente de TanStack Query para la gestión del estado del servidor
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita recargas innecesarias al cambiar de pestaña
      retry: 1, // Reintenta una sola vez en caso de falla de red
    },
  },
});

// Configuración de los parámetros de tu cliente Keycloak (RNF-01)
const keycloak = new Keycloak({
  url: 'http://localhost:9090', // Cambia por la URL real de tu contenedor Keycloak
  realm: 'TaskManagement',           // Reemplaza por el nombre de tu Realm
  clientId: 'task-frontend',        // Reemplaza por tu Client ID configurado
});

// Inicialización del flujo OIDC con carga obligatoria de Login
keycloak
  .init({
    onLoad: 'login-required',
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (authenticated) {
      // Extraemos los roles globales asignados al usuario en el Realm
      const realmRoles = keycloak.realmAccess?.roles || [];
      const isAdmin = realmRoles.includes('ADMIN');

      // Cargamos el Token y los datos parseados de forma reactiva en Zustand
      useAuthStore.getState().setAuth(
        keycloak.token || '',
        {
          id: keycloak.tokenParsed?.sub || 'unknown',
          name: keycloak.tokenParsed?.preferred_username || 'Usuario',
          role: isAdmin ? 'ADMIN' : 'USER',
        }
      );

      useAuthStore.getState().setLogoutCallback(() => {
        keycloak.logout({ redirectUri: 'http://localhost:5173' }); 
      });

      // Renovación automática: Si el token va a expirar en los próximos 30s, se refresca de forma transparente
      setInterval(() => {
        keycloak.updateToken(30).then((refreshed) => {
          if (refreshed) {
            useAuthStore.getState().setToken(keycloak.token || '');
          }
        });
      }, 60000);

      // Una vez aseguradas las credenciales, montamos la UI en el DOM
      ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
            <TasksDashboard />
          </QueryClientProvider>
        </React.StrictMode>
      );
    }
  })
  .catch((error) => {
    console.error('Error crítico al inicializar el servicio Keycloak:', error);
    document.body.innerHTML = `
      <div style="font-family: sans-serif; text-align: center; padding-top: 100px; color: #ef4444;">
        <h2>Error de Autenticación</h2>
        <p>No se pudo conectar con el servidor de identidad. Verifica que Keycloak esté activo.</p>
      </div>
    `;
  });