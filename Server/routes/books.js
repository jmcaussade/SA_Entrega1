const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

module.exports = (redisClient) => {
    router.post('/', (req, res) => booksController.createBook(redisClient, req, res));    
    router.get('/', (req, res) => booksController.getBooks(redisClient, req, res));
    router.get('/:id', booksController.getBookById);
    router.put('/:id', booksController.updateBook);
    router.delete('/:id', booksController.deleteBook);

    return router;

};
