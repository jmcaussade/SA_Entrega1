const nano = require('nano')('http://admin:admin@couchdb:5984');
const db = nano.use('bookstore');

const searchBooks = async (req, res) => {
  const { query, page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const books = await db.list({ include_docs: true });
    const bookDocs = books.rows
      .filter(row => row.doc.type === 'book')
      .map(row => row.doc)
      .filter(book => book.description.toLowerCase().includes(query.toLowerCase()));

    const totalPages = Math.ceil(bookDocs.length / limit);
    const paginatedBooks = bookDocs.slice(skip, skip + limit);

    res.json({ books: paginatedBooks, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = { searchBooks };
