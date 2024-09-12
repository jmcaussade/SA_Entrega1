const express = require('express');
const router = express.Router();
const aggregatedDataController = require('../controllers/aggregatedDataController');

module.exports = (redisClient) => {
    router.get('/', (req, res) => {aggregatedDataController.getAggregatedData(redisClient, req, res)});

    return router;
};