# --- Etapa de construcción ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/ 
RUN npm ci
COPY . .
# 🌟 Forzamos a que si el build falla, Docker se detenga y te muestre el error real aquí
RUN npx prisma generate
RUN npm run build

# --- Etapa de producción ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
# 🌟 Usamos una validación: si encuentra dist/src/main.js lo ejecuta, si no, usa dist/main.js
CMD ["sh", "-c", "if [ -f dist/src/main.js ]; then node dist/src/main.js; else node dist/main.js; fi"]