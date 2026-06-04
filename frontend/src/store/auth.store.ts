// EFC: Almacén de Autenticación (/src/store/auth.store.ts)Este archivo 
// mantendrá en memoria el token JWT y el objeto del usuario parseado desde Keycloak. 
// Será consumido tanto por la UI para validar roles como por Axios 
// para inyectar las credenciales automáticamente.

import { create } from 'zustand';
import { type User } from '../features/tasks/types';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  onLogoutCallback: (() => void) | null; // 🌟 Espacio para guardar el logout de Keycloak
  setLogoutCallback: (callback: () => void) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  onLogoutCallback: null,
  setAuth: (token, user) => set({ token, user }),
  setToken: (token) => set({ token }),
  setLogoutCallback: (callback) => set({ onLogoutCallback: callback }),
  logout: () => {
    const callback = get().onLogoutCallback;
    set({ token: null, user: null });
    
    if (callback) {
      callback(); // 🌟 Gatilla el flujo oficial de salida de Keycloak
    } else {
      window.location.reload();
    }
  },
}));