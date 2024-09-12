const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authorsController');

module.exports = (redisClient) => {
    router.get('/', (req, res) => {authorsController.getAuthors(redisClient, req, res)});
    router.post('/', (req, res) => {authorsController.createAuthor(redisClient, req, res)});
    router.delete('/:id', (req, res) => {authorsController.deleteAuthor(redisClient, req, res)});
    router.put('/:id', (req, res) => {authorsController.updateAuthor(redisClient, req, res)});
    router.get('/:id', authorsController.getAuthorById);

    return router;
};
