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

# Construye el frontend
RUN npm run build

# Usa una imagen Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copia los archivos estáticos construidos por Vite
COPY --from=0 /app/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
