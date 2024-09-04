const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

const fetchAuthors = async (redisClient, req, res) => {
  const useCache = process.env.USE_CACHE === 'true';
  console.log('USE_CACHE:', process.env.USE_CACHE); // Log the value of USE_CACHE
  //console.log('useCache:', useCache); // Log the value of useCache
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
const fetchAuthorById = async (redisClient, authorId) => {
  const useCache = process.env.USE_CACHE === 'true';
  const cacheKey = `author:${authorId}`;

  if (useCache) {
    return new Promise((resolve, reject) => {
      redisClient.get(cacheKey, async (err, data) => {
        if (err) {
          return reject(err);
        }

        if (data) {
          console.log(`Fetching author ${authorId} from cache`);
          return resolve(JSON.parse(data));
        } else {
          console.log(`Fetching author ${authorId} from database`);
          try {
            const result = await db.get(authorId);
            redisClient.setex(cacheKey, 3600, JSON.stringify(result));
            return resolve(result);
          } catch (dbError) {
            return reject(dbError);
          }
        }
      });
    });
  } else {
    console.log(`Fetching author ${authorId} from database (cache disabled)`);
    try {
      const result = await db.get(authorId);
      return result;
    } catch (dbError) {
      throw dbError;
    }
  }
};

const createAuthor = async (redisClient, authorData) => {
  const useCache = process.env.USE_CACHE === 'true';

  try {
    const result = await db.insert(authorData);
    if (useCache) {
      console.log('Invalidating authors cache');
      redisClient.del('authors');
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const updateAuthor = async (redisClient, req, res) => {
  console.log("dentro update method author controller")
  const useCache = process.env.USE_CACHE === 'true';
  const authorId = req.params.id; // Extract ID from request parameters
  const authorData = req.body; // Extract data from request body

  console.log('Update author called with ID:', authorId);
  console.log('Incoming authorData:', authorData);

  try {
    // Fetch the existing author document
    const author = await db.get(authorId);
    console.log('Fetched author from database:', author);

    // Prepare updated data
    const updatedAuthorData = { ...author, ...authorData, _id: authorId, _rev: author._rev };
    console.log('Prepared updatedAuthorData:', updatedAuthorData);

    // Update the author in CouchDB
    const result = await db.insert(updatedAuthorData);
    console.log('CouchDB update result:', result);

    // Handle caching
    if (useCache) {
      console.log(`Invalidating cache for author ${authorId} and authors list`);
      await redisClient.del(`author:${authorId}`);
      await redisClient.del('authors');
    }

    // Respond with the result
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating author:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
    res.status(500).json({ error: error.message });
  }
};


const deleteAuthor = async (redisClient, req, res) => {
  const useCache = process.env.USE_CACHE === 'true';
  console.log("dentro delete method author controller")
  try {
    // Fetch the document to get its revision (_rev)
    const author = await db.get(req.params.id);

    // Delete the document from CouchDB
    await db.destroy(author._id, author._rev);

    if (useCache) {
      // Invalidate cache for the deleted author and the authors list
      console.log(`Invalidating cache for author ${req.params.id} and authors list`);
      redisClient.del('authors'); // Invalidate the authors list cache
      await redisClient.del(`author:${req.params.id}`);
      await redisClient.del('authors');
    }

    res.status(204).end(); // Respond with no content after successful deletion
  } catch (error) {
    console.error(`Error deleting author with ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchAuthors, fetchAuthorById, createAuthor, updateAuthor, deleteAuthor };