const express = require('express');
const router = express.Router();
const topBooksController = require('../controllers/topBooksController');

router.get('/', topBooksController.getTopRatedBooks);

module.exports = router;
