# Etapa 1: Construcción (builder)
FROM node:18-alpine AS builder

# Instalar dependencias del sistema necesarias para mssql
RUN apk add --no-cache python3 make g++

# Crear un directorio para la app
WORKDIR /usr/src/app

# Copiar los archivos de package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies necesarias para build)
RUN npm ci

# Copiar el código fuente
COPY . .

# Copiar el archivo .env
COPY .env ./

# Ejecutar el build de producción
RUN npm run build

# Etapa 2: Imagen final (más ligera)
FROM node:18-alpine

# Instalar dependencias del sistema para runtime de mssql
RUN apk add --no-cache python3 make g++

# Crear un directorio para la app
WORKDIR /usr/src/app

# Copiar solo los archivos necesarios desde la etapa de construcción
COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY --from=builder /usr/src/app/package*.json /usr/src/app/
COPY --from=builder /usr/src/app/.env /usr/src/app/.env

# Instalar solo las dependencias de producción
RUN npm ci --only=production

# Configurar el puerto
# EXPOSE 3001

# Comando para iniciar la aplicación en producción
CMD ["npm", "run", "start:prod"]