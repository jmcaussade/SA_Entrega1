const nano = require('nano')('http://admin:admin@couchdb:5984');
const db = nano.use('bookstore');

// Crear una reseña
exports.createReview = async (redisClient, req, res) => {
  console.log("dentro de createReview"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  try {
    console.log("Request Body:", req.body); // Debugging

    // Create the new review in CouchDB
    const review = {
      ...req.body,
      type: 'review',
    };
    const result = await db.insert(review);
    console.log('CouchDB create result:', result);

    if (useCache) {
      // Invalidate the cache for the reviews list
      console.log('Invalidating cache for reviews list');
      await redisClient.del('reviews');

      // Cache the newly created review data
      const newReviewId = result.id;
      const cacheData = { ...req.body, _id: newReviewId };
      await redisClient.setEx(`review:${newReviewId}`, 3600, JSON.stringify(cacheData));
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating review:', error.message); // Debugging
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las reseñas
exports.getReviews = async (redisClient, req, res) => {
  console.log("dentro de getReviews"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  console.log('USE_CACHE:', process.env.USE_CACHE); // Log the value of USE_CACHE
  const cacheKey = 'reviews';

  if (useCache) {
    console.log('Attempting to fetch from cache');
    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log('Fetching reviews from cache');
        const reviews = JSON.parse(cachedData);
        return res.status(200).json(reviews);
      } else {
        console.log('Cache miss. Fetching reviews from database');
        const result = await db.list({ include_docs: true });
        const reviews = result.rows.filter(row => row.doc.type === 'review').map(row => row.doc);
        // Store the fetched reviews in Redis cache for 1 hour (3600 seconds)
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(reviews));
        return res.status(200).json(reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews from cache or database:', err);
      return res.status(500).json({ error: 'Error fetching reviews' });
    }
  } else {
    console.log('Fetching reviews from database (cache disabled)');
    try {
      const result = await db.list({ include_docs: true });
      const reviews = result.rows.filter(row => row.doc.type === 'review').map(row => row.doc);
      return res.status(200).json(reviews);
    } catch (dbError) {
      console.error('Error fetching reviews from database:', dbError);
      return res.status(500).json({ error: 'Error fetching reviews from database' });
    }
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

exports.updateReview = async (redisClient, req, res) => {
  const useCache = process.env.USE_CACHE === 'true';
  const reviewId = req.params.id; // Extract the review ID from request parameters

  console.log('dentro updateReview');
  console.log('Request Params:', req.params);
  console.log('Review ID:', reviewId);

  try {
    // Fetch the current review from the database
    const review = await db.get(reviewId);

    // Merge the existing review with the updated data
    const updatedReview = { ...review, ...req.body };

    // Update the review in the database
    const result = await db.insert(updatedReview);
    res.status(200).json(result);

    if (useCache) {
      // Invalidate the cache for the updated review
      console.log('Invalidating cache for review:', reviewId);
      await redisClient.del(`review:${reviewId}`);

      // Optionally, invalidate the cache for the entire reviews list
      console.log('Invalidating cache for all reviews');
      await redisClient.del('reviews');

      // Cache the updated review data
      await redisClient.setEx(`review:${reviewId}`, 3600, JSON.stringify(updatedReview));
    }
  } catch (error) {
    console.error('Error updating review:', error); // Debugging
    res.status(500).json({ error: error.message });
  }
};


// Eliminar una reseña
exports.deleteReview = async (redisClient, req, res) => {
  const useCache = process.env.USE_CACHE === 'true';
  console.log('dentro deleteReview');
  
  try {
    const review = await db.get(req.params.id);
  
    console.log('Review from request Params:', review);

    console.log("ID review to delete: ", review._id)
    console.log("REV review to delete: ", review._rev)
    await db.destroy(review._id, review._rev);

    if (useCache) {
      // Invalidate the cache for the deleted review
      console.log('Invalidating cache for review:', review._id);
      await redisClient.del(`review:${review._id}`);

      // Optionally, invalidate the cache for the entire reviews list
      console.log('Invalidating cache for all reviews');
      await redisClient.del('reviews');
    }

    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting review with ID ${review._id}:`, error);
    res.status(500).json({ error: error.message });
  }
};
