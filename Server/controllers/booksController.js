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
exports.getBooks = async (req, res) => {
  try {
    const result = await db.list({ include_docs: true });
    const books = result.rows
      .filter(row => row.doc.type === 'book')
      .map(row => ({
        id: row.id, // Aquí asegúrate de mapear el ID correctamente
        ...row.doc,
      }));
    res.status(200).json(books);
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
