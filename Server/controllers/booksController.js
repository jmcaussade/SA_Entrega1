const nano = require('nano')('http://admin:admin@localhost:5984');
const db = nano.use('bookstore');
const client = require('../utils/searchEngine');



// Crear un libro e indexarlo en Elasticsearch
exports.createBook = async (req, res) => {
  try {
    const result = await db.insert(req.body);
    // Indexar el libro en Elasticsearch
    await client.index({
      index: 'books',
      id: result.id,
      body: req.body,
    });
    res.status(201).json(result);
  } catch (error) {
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


// Eliminar un libro y removerlo de Elasticsearch
exports.deleteBook = async (req, res) => {
  try {
    const book = await db.get(req.params.id);
    await db.destroy(book._id, book._rev);
    // Eliminar de Elasticsearch
    await client.delete({
      index: 'books',
      id: book._id,
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};