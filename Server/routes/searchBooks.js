const express = require('express');
const router = express.Router();
const { searchBooks } = require('../controllers/searchBooksController');

router.get('/search-books', searchBooks);

module.exports = router;
