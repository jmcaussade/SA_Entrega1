# Usa una imagen oficial de Node.js como base
FROM node:22 AS build

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto 5173
EXPOSE 5173

# Construye el frontend
CMD [ "npm", "run", "dev" ]
