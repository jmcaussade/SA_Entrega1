const express = require('express');
const router = express.Router();
const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query parameter is required' });

    const books = await db.list({ include_docs: true });
    const bookDocs = books.rows.filter(row => row.doc.type === 'book').map(row => row.doc);

    // Ensure that `summary` exists and filter based on it
    const results = bookDocs.filter(book => 
      book.summary && book.summary.toLowerCase().includes(query.toLowerCase())
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
