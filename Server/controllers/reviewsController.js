const nano = require('nano')('http://admin:admin@localhost:5984');
const db = nano.use('bookstore');
const client = require('../utils/searchEngine');

// Crear una reseña
exports.createReview = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging
    const review = {
      ...req.body,
      type: 'review',
    };
    const result = await db.insert(review);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating review:", error); // Debugging
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las reseñas
exports.getReviews = async (req, res) => {
  try {
    const result = await db.list({ include_docs: true });
    const reviews = result.rows.filter(row => row.doc.type === 'review').map(row => row.doc);
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error); // Debugging
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

// Actualizar una reseña
exports.updateReview = async (req, res) => {
  try {
    const review = await db.get(req.params.id);
    const updatedReview = { ...review, ...req.body };
    const result = await db.insert(updatedReview);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating review:", error); // Debugging
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una reseña
exports.deleteReview = async (req, res) => {
  try {
    const review = await db.get(req.params.id);
    await db.destroy(review._id, review._rev);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
