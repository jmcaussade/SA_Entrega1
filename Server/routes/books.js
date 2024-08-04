const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

router.post('/', booksController.createBook);
router.get('/', booksController.getBooks);
router.get('/:id', booksController.getBookById);
router.put('/:id', booksController.updateBook);
router.delete('/:id', booksController.deleteBook);

module.exports = router;
