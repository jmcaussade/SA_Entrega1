const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

module.exports = (redisClient) => {
  router.get('/', (req, res) => {reviewsController.getReviews(redisClient, req, res)});
  router.post('/', (req, res) => {reviewsController.createReview(redisClient, req, res)});
  router.delete('/:id', (req, res) => {reviewsController.deleteReview(redisClient, req, res)});
  router.put('/:id', (req, res) => {reviewsController.updateReview(redisClient, req, res)});
  router.get('/:id', reviewsController.getReviewById);
  return router;
};

