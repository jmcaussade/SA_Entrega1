const nano = require('nano')('http://admin:admin@localhost:5984');
const db = nano.use('bookstore');
const client = require('../utils/searchEngine');


// Obtener todos los libros
exports.getBooks = async (redisClient, req, res) => {
  console.log("dentro de getBooks"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  console.log('USE_CACHE:', process.env.USE_CACHE); // Log the value of USE_CACHE
  const cacheKey = 'books';

  try {
    let books;
    
    if (useCache) {
      console.log('Attempting to fetch from cache');
      const cachedData = await redisClient.get(cacheKey);
      //console.log('cachedData:', cachedData); // Debugging

      if (cachedData) {
        console.log('Fetching books from cache');
        books = JSON.parse(cachedData);
        //console.log('books:', books); // Debugging
      } else {
        console.log('Cache miss. Fetching books from database');
        const result = await db.list({ include_docs: true });
        books = result.rows.filter(row => row.doc.type === 'book').map(row => row.doc);
        // Store the fetched books in Redis cache for 1 hour (3600 seconds)
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(books));
      }
    } else {
      console.log('Fetching books from database (cache disabled)');
      const result = await db.list({ include_docs: true });
      books = result.rows.filter(row => row.doc.type === 'book').map(row => row.doc);
    }
    
    // Send the response once
    res.status(200).json(books);

  } catch (error) {
    console.log("Error fetching books:", error.message); // Debugging
    res.status(500).json({ error: error.message });
  }
};

// Crear un libro e indexarlo en Elasticsearch
exports.createBook = async (redisClient, req, res) => {
  console.log("dentro de createBook"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  
  try {
    const result = await db.insert(req.body);
    console.log('Book inserted:', result);

    // Indexar el libro en Elasticsearch
    await client.index({
      index: 'books',
      id: result.id,
      body: req.body,
    });
    console.log('Book indexed in Elasticsearch');

    if (useCache) {
      console.log('Clearing cache');
      await redisClient.del('books');

      // Cache the newly created book data
      console.log('Caching new book data');
      const cacheData = { ...req.body, _id: result.id };
      await redisClient.setEx(`book:${result.id}`, 3600, JSON.stringify(cacheData));
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un libro y removerlo de Elasticsearch
exports.deleteBook = async (redisClient, req, res) => {
  console.log("dentro de deleteBook"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';

  try {
    console.log('Received request to delete book with ID:', req.params.id); // Log the received ID
    const book = await db.get(req.params.id);
    console.log('Book to delete:', book);

    await db.destroy(book._id, book._rev);
    console.log('Book deleted from database');

    // Delete from Elasticsearch
    try {
      await client.delete({
        index: 'books',
        id: req.params.id
      });
      console.log('Book deleted from Elasticsearch');
    } catch (esError) {
      if (esError.meta && esError.meta.statusCode === 404) {
        console.warn('Book not found in Elasticsearch');
      } else {
        throw esError;
      }
    }

    if (useCache) {
      console.log('Invalidating cache for the book:', book._id);
      await redisClient.del(`book:${book._id}`);

      //Invalidating cache for the hole books list
      console.log('Invalidating cache for all books');
      await redisClient.del('books');
    }

    res.status(204).end();
  } catch (error) {
    if (error.statusCode === 404 && error.reason === 'deleted') {
      console.log('Book already deleted:', req.params.id);
      res.status(204).end(); // No Content
    } else {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

// Actualizar un libro
exports.updateBook = async (req, res) => {
  try {
    const book = await db.get(req.params.id);
    const updatedBook = { ...book, ...req.body };
    const result = await db.insert(updatedBook);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Obtener un libro por ID
exports.getBookById = async (req, res) => {
  try {
    const book = await db.get(req.params.id);
    if (book.type === 'book') {
      res.status(200).json(book);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};