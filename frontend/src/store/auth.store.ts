import { create } from 'zustand';

interface AuthState {
  token: string | null;
  roles: string[];
  setAuth: (token: string, roles: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  roles: [],

  setAuth: (token, roles) =>
    set({
      token,
      roles,
    }),

  logout: () =>
    set({
      token: null,
      roles: [],
    }),
}));