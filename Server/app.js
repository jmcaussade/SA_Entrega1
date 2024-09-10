const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require("cors");

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

// Middleware para habilitar CORS
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

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

app.listen(port, () => {
  console.log(`Server is running on http://miapp.localhost:${port}`);
});
