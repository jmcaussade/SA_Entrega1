const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require("cors");
const redis = require('redis');
require('dotenv').config();

const booksRoutes = require('./routes/books');
const authorsRoutes = require('./routes/authors');
const reviewsRoutes = require('./routes/reviews');
const salesRoutes = require('./routes/sales');
const aggregatedDataRoutes = require('./routes/aggregatedData');
const topBooksRoutes = require('./routes/topBooks');
const searchBooksRoutes = require('./routes/searchBooks')
const topsalesRoutes = require('./routes/topsales')


const app = express();
const port = 5000;

console.log("Starting application...")

//Redis client
const redisClient = redis.createClient();

redisClient.on('error', (error) => {
  console.error('Error connecting to Redis:', error);
});

redisClient.on('ready', () => {
  console.log('Redis client started');
});

(async () => {
  await redisClient.connect();
  await redisClient.ping();
})();

// Middleware para habilitar CORS
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON

// Sirve archivos estáticos si no se está usando Caddy
if (process.env.USE_CADDY !== 'true') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// // Rutas de la API
app.use('/api/authors', authorsRoutes(redisClient));
app.use('/api/books', booksRoutes(redisClient));
app.use('/api/reviews', reviewsRoutes(redisClient));
app.use('/api/sales', salesRoutes(redisClient));
app.use('/api/aggregated-data', aggregatedDataRoutes(redisClient));
app.use('/api/top-books', topBooksRoutes(redisClient));
app.use('/api/search-books', searchBooksRoutes);
app.use('/api/top-sales', topsalesRoutes)




// Ruta principal para la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://miapp.localhost:${port}`);
});
