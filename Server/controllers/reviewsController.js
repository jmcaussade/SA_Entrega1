const nano = require('nano')('http://admin:admin@couchdb:5984');
const db = nano.use('bookstore');
const client = require('../utils/searchEngine');

// Obtener todas las reseñas
exports.getReviews = async (redisClient, req, res) => {
  console.log("Inside getReviews"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  const cacheKey = 'reviews';

  if (useCache) {
    console.log("Attempting to fetch from cache"); // Debugging
    try{
      const data = await redisClient.get(cacheKey);

      if (data) {
        console.log("Fetching reviews from cache"); // Debugging
        const reviews = JSON.parse(data);
        return res.json(reviews);
      } else {
        console.log("Cache miss. Fetching reviews from database"); // Debugging
        const result = await db.list({ include_docs: true });
        const reviews = result.rows.filter(row => row.doc.type === 'review').map(row => row.doc);
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(reviews));
        return res.json(reviews);
      }
    } catch(error) {
      console.error("Error fetching from cache:", error); // Debugging
      return res.status(500).json({ error: 'Error fetching from cache' });
    }
  } else {
    console.log("Fetching reviews from database (cache disabled)"); // Debugging
    try {
      const result = await db.list({ include_docs: true });
      const reviews = result.rows.filter(row => row.doc.type === 'review').map(row => row.doc);
      return res.json(reviews);
    } catch (dbError) {
      console.error("Error fetching reviews from database:", dbError); // Debugging
      return res.status(500).json({ error: 'Error fetching reviews from database' });
    }
  }
};

// Eliminar una reseña
exports.deleteReview = async (redisClient, req, res) => {
  console.log("Inside deletingReview..."); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  try {
    console.log("Deleting review with ID:", req.params.id); // Debugging
    const review = await db.get(req.params.id);
    await db.destroy(review._id, review._rev);

    if (useCache) {
      console.log("Deleting review from cache"); // Debugging
      await redisClient.del('review:${req.params.id}');
      await redisClient.del('reviews');
      
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una reseña
exports.updateReview = async (redisClient, req, res) => {
  console.log("Inside updateReview..."); // Debugging
  
  try {
    const review = await db.get(req.params.id);
    const updatedReview = { ...review, ...req.body };
    const result = await db.insert(updatedReview);

    // Invalidate cache
    const useCache = process.env.USE_CACHE === 'true';
    if (useCache) {
      console.log('Clearing cache');
      await redisClient.del('reviews');

      // Remove the specific review from cache
      console.log('Removing review from cache');
      await redisClient.del(`review:${req.params.id}`);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating review:", error); // Debugging
    res.status(500).json({ error: error.message });
  }
};


// Crear una reseña
exports.createReview = async (redisClient, req, res) => {
  console.log("Inside createReview..."); // Debugging
  
  try {
    console.log("Request Body:", req.body); // Debugging
    const review = {
      ...req.body,
      type: 'review',
    };
    const result = await db.insert(review);

    // Invalidate cache
    const useCache = process.env.USE_CACHE === 'true';
    if (useCache) {
      console.log('Clearing cache');
      await redisClient.del('reviews');
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating review:", error); // Debugging
    res.status(500).json({ error: error.message });
  }
};

// Obtener una reseña por ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await db.get(req.params.id);
    if (review.type === 'review') {
      res.status(200).json(review);
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    console.error("Error fetching review by ID:", error); // Debugging
    res.status(500).json({ error: error.message });
  }
};