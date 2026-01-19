# =====================================================
# ALQVIMIA RPA 2.0 - Backend Dockerfile
# =====================================================

FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para Playwright y MySQL
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    netcat-openbsd

# Configurar Playwright para usar Chromium instalado del sistema
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (sin --only=production para incluir playwright)
RUN npm ci

# Copiar código fuente
COPY . .

# Crear directorio para logs y datos
RUN mkdir -p /app/logs /app/data

# Exponer puerto (debe coincidir con BACKEND_PORT del .env)
EXPOSE 4000

# Script de espera para MySQL
COPY wait-for-mysql.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-mysql.sh

# Usuario no root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Comando de inicio con espera para MySQL
CMD ["sh", "-c", "wait-for-mysql.sh && node server.js"]
