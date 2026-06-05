import { defineConfig,loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga el archivo .env según el modo (development o production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/keycloak-admin': {
          // Lee la URL de Keycloak desde el .env o usa el valor por defecto
          target: env.VITE_KEYCLOAK_URL || 'http://localhost:9090',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/keycloak-admin/, ''),
        },
      },
    },
  };
});