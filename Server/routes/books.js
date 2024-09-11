const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

module.exports = (redisClient) => {
    router.get('/', (req, res) => {booksController.getBooks(redisClient, req, res)});
    router.post('/', booksController.createBook);
    router.delete('/:id', booksController.deleteBook);
    router.put('/:id', booksController.updateBook);
    router.get('/:id', booksController.getBookById);

    return router;
}
