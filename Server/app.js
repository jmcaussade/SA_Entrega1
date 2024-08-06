const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require("cors");

const booksRoutes = require('./routes/books');
const authorsRoutes = require('./routes/authors');
const reviewsRoutes = require('./routes/reviews');
const salesRoutes = require('./routes/sales');
const aggregatedDataRoutes = require('./routes/aggregatedData');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Middleware
app.use(bodyParser.json());

// Rutas API
app.use('/api/books', booksRoutes);
app.use('/api/authors', authorsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/aggregated-data', aggregatedDataRoutes);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Cualquier ruta no manejada por las rutas anteriores responderá con el archivo index.html del frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
