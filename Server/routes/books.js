const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

module.exports = (redisClient) => {
    router.get('/', (req, res) => {booksController.getBooks(redisClient, req, res)});
    router.post('/', (req, res) => {booksController.createBook(redisClient, req, res)});
    router.delete('/:id', (req, res) => {booksController.deleteBook(redisClient, req, res);});
    router.put('/:id', (req, res) => {booksController.updateBook(redisClient, req, res)});
    router.get('/:id', booksController.getBookById);

    return router;
}
