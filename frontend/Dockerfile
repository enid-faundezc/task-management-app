# --- Etapa de construcción ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Etapa de producción ---
FROM nginx:1.25-alpine AS runner
# Copia los archivos estáticos generados al directorio de Nginx
# (Cambia "dist" por "build" o ".next" según lo que use tu framework)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia una configuración básica de Nginx para manejar rutas SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]