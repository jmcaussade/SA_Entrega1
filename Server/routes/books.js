const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

module.exports = (redisClient) => {
    router.get('/', (req, res) => {booksController.getBooks(redisClient, req, res)});
    router.post('/', (req, res) => {booksController.createBook(redisClient, req, res)});
    router.delete('/:id', (req, res) => {
        const bookid = req.params.id;
        console.log("bookid: ", bookid); // Log the received ID
        booksController.deleteBook(redisClient, req, res);
    });
    router.put('/:id', booksController.updateBook);
    router.get('/:id', booksController.getBookById);

    return router;
}
