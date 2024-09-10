const express = require('express');
const path = require('path');
const cors = require("cors");

const booksRoutes = require('./routes/books');
const reviewsRoutes = require('./routes/reviews');
const searchBooksRoutes = require('./routes/searchBooks');

const app = express();
const port = 5000;

// Middleware para habilitar CORS
app.use(cors());
app.use(express.json());

// Sirve archivos estáticos si no se está usando Caddy
if (process.env.USE_CADDY !== 'true') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// // Rutas de la API
app.use('/api/authors', authorsRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/aggregated-data', aggregatedDataRoutes);
app.use('/api/top-books', topBooksRoutes);
app.use('/api/search-books', searchBooksRoutes);
app.use('/api/top-sales', topsalesRoutes)




// Ruta principal para la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port,() => {
  console.log(`Server is running on http://localhost:${port}`);
});
