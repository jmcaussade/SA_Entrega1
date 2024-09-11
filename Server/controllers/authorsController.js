const nano = require('nano')('http://admin:admin@localhost:5984');
const db = nano.use('bookstore');
const redis = require('redis');
const { promisify } = require('util');

// Function to fetch authors from the database
const fetchAuthors = async (redisClient, req, res) => {
  console.log('Fetching authors...');
  const useCache = process.env.USE_CACHE === 'true';
  console.log('USE_CACHE:', process.env.USE_CACHE); // Log the value of USE_CACHE
  const cacheKey = 'authors';

  if (useCache) {
    console.log('Attempting to fetch from cache'); // Log before fetching from cache
    try {
      const data = await redisClient.get(cacheKey);
      console.log('Inside redisClient.get callback'); // Log inside the callback

      if (data) {
        console.log('Fetching authors from cache');
        const authors = JSON.parse(data);
        //console.log('Authors from cache:', authors); // Log the authors data from cache
        return res.json(authors);
      } else {
        console.log('Cache miss. Fetching authors from database');
        const result = await db.list({ include_docs: true });
        const authors = result.rows.filter(row => row.doc.type === 'author').map(row => row.doc);
        //console.log('Authors from database:', authors); // Log the authors data from database
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(authors));
        return res.json(authors);
      }
    } catch (err) {
      console.error('Error fetching from cache:', err);
      return res.status(500).json({ error: 'Error fetching from cache' });
    }
  } else {
    console.log('Fetching authors from database (cache disabled)');
    try {
      const result = await db.list({ include_docs: true });
      const authors = result.rows.filter(row => row.doc.type === 'author').map(row => row.doc);
      //console.log('Authors from database:', authors); // Log the authors data from database
      return res.json(authors);
    } catch (dbError) {
      console.error('Error fetching authors from database:', dbError);
      return res.status(500).json({ error: 'Error fetching authors from database' });
    }
  }
};

exports.getAuthors = async (redisClient, req, res) => {
  console.log('Inside getAuthors controller');
  try {
    await fetchAuthors(redisClient, req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAuthor = async (req, res) => {
  try {
    const result = await db.insert(req.body);
    res.status(201).json(result);
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
