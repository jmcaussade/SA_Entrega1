# Usa una imagen oficial de Node.js como base
FROM node:22

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y el package-lock.json
COPY package.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Construye el frontend
CMD [ "npm", "run", "dev" ]
