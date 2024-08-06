const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

exports.createReview = async (req, res) => {
  try {
    const result = await db.insert(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const result = await db.list({ include_docs: true });
    const reviews = result.rows.filter(row => row.doc.type === 'review').map(row => row.doc);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await db.get(req.params.id);
    if (review.type === 'review') {
      res.status(200).json(review);
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await db.get(req.params.id);
    const updatedReview = { ...review, ...req.body };
    const result = await db.insert(updatedReview);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await db.get(req.params.id);
    await db.destroy(review._id, review._rev);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
