# Usa una imagen oficial de Node.js como base
FROM node:22

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Instala netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto 5000 (puedes cambiarlo si es necesario)
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["node", "app.js"]
