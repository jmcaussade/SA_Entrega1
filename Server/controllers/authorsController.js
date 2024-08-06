const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

// Function to fetch authors from the database
const fetchAuthors = async () => {
  const result = await db.list({ include_docs: true });
  return result.rows.filter(row => row.doc.type === 'author').map(row => row.doc);
};

exports.fetchAuthors = fetchAuthors;

exports.createAuthor = async (req, res) => {
  try {
    const result = await db.insert(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAuthors = async (req, res) => {
  try {
    const authors = await fetchAuthors();
    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAuthorById = async (req, res) => {
  try {
    const author = await db.get(req.params.id);
    if (author.type === 'author') {
      res.status(200).json(author);
    } else {
      res.status(404).json({ error: 'Author not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    const author = await db.get(req.params.id);
    const updatedAuthor = { ...author, ...req.body };
    const result = await db.insert(updatedAuthor);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAuthor = async (req, res) => {
  try {
    const author = await db.get(req.params.id);
    await db.destroy(author._id, author._rev);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
