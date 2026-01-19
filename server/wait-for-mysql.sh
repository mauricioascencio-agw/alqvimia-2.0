#!/bin/sh
# =====================================================
# Script para esperar a que MySQL esté listo
# =====================================================

set -e

host="${MYSQL_HOST:-mysql}"
port="${MYSQL_PORT:-3306}"

echo "Esperando a que MySQL esté listo en $host:$port..."

max_attempts=60
attempt=0

# Esperar a que el puerto esté disponible usando netcat
until nc -z "$host" "$port" > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "Error: MySQL no está disponible en $host:$port después de $max_attempts intentos"
    exit 1
  fi
  echo "Intento $attempt/$max_attempts - MySQL aún no está listo, esperando..."
  sleep 2
done

echo "¡MySQL está listo en $host:$port! Esperando 5 segundos adicionales para asegurar inicialización completa..."
sleep 5

echo "Iniciando servidor backend..."
