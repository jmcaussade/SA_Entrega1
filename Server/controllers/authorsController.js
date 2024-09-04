const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

const fetchAuthors = async (redisClient, req, res) => {
  const useCache = process.env.USE_CACHE === 'true';
  console.log('USE_CACHE:', process.env.USE_CACHE); // Log the value of USE_CACHE
  console.log('useCache:', useCache); // Log the value of useCache
  const cacheKey = 'authors';

  if (useCache) {
    console.log('Attempting to fetch from cache'); // Log before fetching from cache
    try {
      const data = await redisClient.get(cacheKey);
      console.log('Inside redisClient.get callback'); // Log inside the callback

      if (data) {
        console.log('Fetching authors from cache');
        const authors = JSON.parse(data);
        console.log('Authors from cache:', authors); // Log the authors data from cache
        return res.json(authors);
      } else {
        console.log('Cache miss. Fetching authors from database');
        const result = await db.list({ include_docs: true });
        const authors = result.rows.filter(row => row.doc.type === 'author').map(row => row.doc);
        console.log('Authors from database:', authors); // Log the authors data from database
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
      console.log('Authors from database:', authors); // Log the authors data from database
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

const updateAuthor = async (redisClient, authorId, authorData) => {
  const useCache = process.env.USE_CACHE === 'true';

  try {
    const result = await db.insert({ ...authorData, _id: authorId });
    if (useCache) {
      console.log(`Invalidating cache for author ${authorId} and authors list`);
      redisClient.del(`author:${authorId}`);
      redisClient.del('authors');
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const deleteAuthor = async (redisClient, authorId) => {
  const useCache = process.env.USE_CACHE === 'true';

  try {
    const result = await db.remove(authorId);
    if (useCache) {
      console.log(`Invalidating cache for author ${authorId} and authors list`);
      redisClient.del(`author:${authorId}`);
      redisClient.del('authors');
    }
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { fetchAuthors, fetchAuthorById, createAuthor, updateAuthor, deleteAuthor };