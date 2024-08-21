# Usa una imagen oficial de Node.js como base
FROM node:14

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

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
