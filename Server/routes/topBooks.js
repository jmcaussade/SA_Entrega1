const express = require('express');
const router = express.Router();
const { getTopRatedBooks } = require('../controllers/topBooksController');

module.exports = (redisClient) => {
    router.get('/', (req, res) => {getTopRatedBooks(redisClient, req, res)});

    return router;
};
