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

exports.createAuthor = async (redisClient, req, res) => {
  console.log('Creating author...');
  const useCache = process.env.USE_CACHE === 'true';

  try {
    const authorData = {
      type: 'author',
      name: req.body.name,
      date_of_birth: req.body.date_of_birth || '', // Default to empty string if not provided
      country_of_origin: req.body.country_of_origin || '', // Default to empty string if not provided
      description: req.body.description || '' // Default to empty string if not provided
    };

    console.log('Inserting author:', authorData);
    const result = await db.insert(authorData);
    console.log('Author result', result);

    if (useCache) {
      console.log('Clearing cache');
      await redisClient.del('authors');

      // Cache the newly created author data
      console.log('Caching new author data');
      const newAuthorId = result.id;
      const cacheData = { ...authorData, _id: newAuthorId };
      await redisClient.setEx(`author:${newAuthorId}`, 3600, JSON.stringify(cacheData));
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error inserting author:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAuthor = async (redisClient, req, res) => {
  console.log('inside deleteAuthor');
  const useCache = process.env.USE_CACHE === 'true';

  try {
    console.log('Deleting author:', req.params);
    const author = await db.get(req.params.id);
    await db.destroy(author._id, author._rev);

    if (useCache) {
      console.log('Clearing cache');
      await redisClient.del('authors');
      await redisClient.del(`author:${req.params.id}`);
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAuthor = async (redisClient, req, res) => {
  console.log('inside updateAuthor');
  const useCache = process.env.USE_CACHE === 'true';
  console.log("req.params: ", req.params);

  try {
    const author = await db.get(req.params.id);
    console.log('Updating author:', author);

    const updatedAuthorData = { ...author, ...req.body, _id: author._id, _rev: author._rev };
    console.log('Prepared updatedAuthorData:', updatedAuthorData);

    const result = await db.insert(updatedAuthorData);
    console.log('Updated author result:', result);

    if (useCache) {
      console.log('Clearing cache');
      await redisClient.del('authors');

      // Cache the updated author data
      console.log('Caching updated author data');
      await redisClient.setEx(`author:${req.params.id}`, 3600, JSON.stringify(updatedAuthorData));
    }
    res.status(200).json(result);
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


