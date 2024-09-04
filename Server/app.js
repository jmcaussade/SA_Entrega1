console.log('Starting application...');

const express = require('express');
const path = require('path');
const cors = require('cors');
const redis = require('redis');
require('dotenv').config();

const booksRoutes = require('./routes/books');
const authorsRoutes = require('./routes/authors');
const reviewsRoutes = require('./routes/reviews');
const salesRoutes = require('./routes/sales');
const aggregatedDataRoutes = require('./routes/aggregatedData');
const topBooksRoutes = require('./routes/topBooks');
const searchBooksRoutes = require('./routes/searchBooks');
const topsalesRoutes = require('./routes/topsales');

const app = express();
const port = 5000;

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

// Middleware to enable CORS
app.use(cors());
app.use(express.json()); // Middleware to parse JSON

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// API routes
app.use('/api/authors', authorsRoutes(redisClient));
app.use('/api/books', booksRoutes);
app.use('/api/reviews', reviewsRoutes(redisClient));
app.use('/api/sales', salesRoutes);
app.use('/api/aggregatedData', aggregatedDataRoutes);
app.use('/api/topBooks', topBooksRoutes);
app.use('/api/searchBooks', searchBooksRoutes);
app.use('/api/topsales', topsalesRoutes);


// Ruta principal para la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = redisClient;