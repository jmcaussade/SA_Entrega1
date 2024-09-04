console.log('Starting application...');

const express = require('express');
const path = require('path');
const cors = require('cors');
const redis = require('redis');

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

// Create Redis client
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Test Redis connection
redisClient.ping((err, result) => {
  if (err) {
    console.error('Error pinging Redis:', err);
  } else {
    console.log('Redis ping response:', result); // Should print "PONG"
  }
});

// Middleware to enable CORS
app.use(cors());
app.use(express.json()); // Middleware to parse JSON

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// API routes
app.use('/api/authors', authorsRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/aggregatedData', aggregatedDataRoutes);
app.use('/api/topBooks', topBooksRoutes);
app.use('/api/searchBooks', searchBooksRoutes);
app.use('/api/topsales', topsalesRoutes);

// Example route with caching
app.get('/api/authors', async (req, res) => {
  console.log('Received request for /api/authors');
  try {
    const cacheKey = 'authors';
    redisClient.get(cacheKey, async (err, data) => {
      console.log('Inside redisClient.get callback');
      if (err) {
        console.error('Error fetching from Redis:', err);
        return res.status(500).send('Server error');
      }

      if (data) {
        // Data found in cache
        console.log('Data fetched from Redis cache');
        return res.json(JSON.parse(data));
      } else {
        // Data not found in cache, fetch from CouchDB
        console.log('Data not found in cache, fetching from CouchDB');
        try {
          const fetch = (await import('node-fetch')).default;
          console.log('node-fetch imported');
          const response = await fetch('http://localhost:5984/your_database/_all_docs?include_docs=true');
          console.log('Fetch request sent to CouchDB');
          const authors = await response.json();
          console.log('Response received from CouchDB');

          // Log the data fetched from CouchDB
          console.log('Fetched authors from CouchDB:', authors);

          // Store data in cache
          redisClient.setex(cacheKey, 3600, JSON.stringify(authors.rows.map(row => row.doc)), (err) => {
            if (err) {
              console.error('Error setting data in Redis:', err);
            } else {
              console.log('Data cached in Redis');
            }
          });

          return res.json(authors.rows.map(row => row.doc));
        } catch (fetchError) {
          console.error('Error fetching from CouchDB:', fetchError);
          return res.status(500).send('Server error');
        }
      }
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).send('Server error');
  }
});

// Ruta principal para la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});