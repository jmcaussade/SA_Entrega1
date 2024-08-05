# Book Review App

## Descripción

Este proyecto es una aplicación web básica para gestionar reseñas de libros, utilizando un backend en Express.js y un frontend con React y Vite. La aplicación permite gestionar autores, libros, reseñas y ventas, y ofrece varias vistas para mostrar información y datos de manera interactiva.

## Estructura del Proyecto

```plaintext
  project/
  ├── front/                  # Carpeta para el frontend
  │   ├── public/
  │   ├── src/
  │   │   ├── components/      # Componentes React
  │   │   ├── hooks/           # Hooks personalizados (si es necesario)
  │   │   ├── pages/           # Páginas de la aplicación
  │   │   ├── services/        # Servicios para llamadas a la API
  │   │   ├── App.jsx
  │   │   ├── index.css
  │   │   └── main.jsx
  │   ├── index.html
  │   ├── package.json
  │   └── vite.config.js
  ├── server/                 # Carpeta para el backend
  │   ├── controllers/         # Controladores para manejar la lógica
  │   ├── routes/              # Rutas de la API
  │   ├── utils/               # Utilidades como la conexión a CouchDB
  │   ├── scripts/             # Scripts adicionales, como para poblar la base de datos
  │   ├── dist/                # Archivos estáticos generados por Vite
  │   ├── app.js               # Configuración del servidor Express
  │   ├── package.json
  └── README.md
```
## Requisitos
Node.js (v14 o superior)
NPM (v6 o superior)
CouchDB (o cualquier base de datos compatible con el script de poblamiento)


# Instalación y Ejecución



# Comando para clonar un repositorio
```bash
git clone <tu-repositorio>
```
# Navegar a la carpeta del proyecto
cd <tu-repositorio>

# Instalar dependencias para el backend
cd server
npm install

# Instalar dependencias para el frontend
cd ../front
npm install

# Construir el frontend
npm run build

# Poblar la base de datos
cd ../server
node scripts/populateDatabase.js

# Iniciar el servidor
node app.js


# Descripción de los Archivos

## server/app.js
Configura el servidor Express y sirve los archivos estáticos generados por Vite. También define las rutas de la API.

## server/controllers/
Contiene la lógica para manejar las solicitudes y respuestas de la API para autores, libros, reseñas y ventas.

## server/routes/
Define las rutas de la API que corresponden a las funcionalidades de la aplicación.

## server/utils/
Contiene utilidades como la conexión a la base de datos CouchDB.

## server/scripts/populateDatabase.js
Script para poblar la base de datos con datos ficticios.

## front/src/components/
Contiene los componentes React para listar y gestionar autores, libros, reseñas y ventas.

## front/src/pages/
Contiene las páginas de la aplicación, incluyendo las vistas para autores, libros, reseñas y ventas.

## front/src/services/api.js
Define los servicios para realizar llamadas a la API del backend.

# Problemas Comunes

## Error "Network Error"
Si ves un error de red en el frontend, verifica que el servidor backend esté corriendo y accesible en [http://localhost:5000](http://localhost:5000).

## Error "No routes matched location"
Este error indica que no se ha definido una ruta correspondiente en el frontend. Asegúrate de que los componentes de las rutas existan y estén correctamente importados.

