# Etapa de construcción
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de ejecución
FROM node:20
WORKDIR /app

# ✅ Instalar CLI de Nest globalmente (para start:dev)
RUN npm install -g @nestjs/cli

# ✅ Copiar los archivos necesarios
COPY package*.json ./
RUN npm install

# ✅ Copiar el código compilado (dist) y todo el src si usas --watch
COPY . .

# ✅ Comando de inicio
CMD ["npm", "run", "start:dev"]

EXPOSE 3000