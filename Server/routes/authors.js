const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authorsController');

module.exports = (redisClient) => {
    router.get('/', (req, res) => {authorsController.getAuthors(redisClient, req, res)});
    router.post('/', (req, res) => {authorsController.createAuthor(redisClient, req, res)});
    router.put('/:id', authorsController.updateAuthor);
    router.delete('/:id', authorsController.deleteAuthor);
    router.get('/:id', authorsController.getAuthorById);

    return router;
};
