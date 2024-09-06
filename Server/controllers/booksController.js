const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

// Crear un libro
exports.createBook = async (redisClient, req, res) => {
  console.log("dentro de createBook"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  try {
    console.log("Request Body:", req.body); // Debugging

    const book = {
      ...req.body,
      type: 'book',

    };

    const result = await db.insert(book);
    console.log('CouchDB create result:', result);

    if (useCache) {
      // Invalidate the cache for the books list
      console.log('Invalidating cache for books list');
      await redisClient.del('books');

      // Cache the newly created book data
      const newBookId = result.id;
      const cacheData = { ...req.body, _id: newBookId };
      await redisClient.setEx(`book:${newBookId}`, 3600, JSON.stringify(cacheData));
    }

    res.status(201).json(result);
  } catch (error) {
    console.log("Error creating book:", error.message); // Debugging
    res.status(500).json({ error: error.message });
  }
};


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

// Actualizar un libro
exports.updateBook = async (redisClient, req, res) => {
  console.log("dentro de updateBook"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';

  try {
    // Fetch the current book from the database
    const book = await db.get(req.params.id);
    console.log("Book to update:", book); // Debugging

    // Merge the existing book data with the new data from the request body
    const updatedBook = { ...book, ...req.body };

    // Perform the update operation in CouchDB
    const result = await db.insert(updatedBook);
    console.log('CouchDB update result:', result);

    // Send the response to the client with the result of the update
    res.status(200).json(result);

    if (useCache) {
      // Invalidate the cache for the updated book
      console.log('Invalidating cache for the book:', book._id);
      await redisClient.del(`book:${book._id}`);

      // Optionally invalidate the cache for the entire books list
      console.log('Invalidating cache for all books');
      await redisClient.del('books');

      // Cache the updated book data
      console.log('Caching updated book data:', updatedBook);
      await redisClient.setEx(`book:${book._id}`, 3600, JSON.stringify(updatedBook));
    }
  } catch (error) {
    console.error("Error updating book:", error.message); // Debugging
    res.status(500).json({ error: error.message });
  }
};
// Eliminar un libro
exports.deleteBook = async (req, res) => {
  try {
    const book = await db.get(req.params.id);
    await db.destroy(book._id, book._rev);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
