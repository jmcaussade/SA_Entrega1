const express = require('express');
const router = express.Router();
const { getTopRatedBooks } = require('../controllers/topBooksController');

router.get('/', getTopRatedBooks);

module.exports = router;
