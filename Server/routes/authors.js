const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authorsController');

module.exports = (redisClient) => {
  router.post('/', (req, res) => authorsController.createAuthor(redisClient, req, res));
  router.get('/', (req, res) => {
    console.log('Received request to fetch authors'); // Add this log
    authorsController.fetchAuthors(redisClient, req, res);
  });
  router.get('/:id', (req, res) => authorsController.fetchAuthorById(redisClient, req, res));
  router.put('/:id', (req, res) => authorsController.updateAuthor(redisClient, req, res));
  router.delete('/:id', (req, res) => authorsController.deleteAuthor(redisClient, req, res));

  return router;
};