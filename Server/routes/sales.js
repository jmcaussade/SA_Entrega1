const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

module.exports = (redisClient) => {
    router.post('/', (req, res) => salesController.createSale(redisClient, req, res));
    router.get('/', (req, res) => salesController.getSales(redisClient, req, res));
    router.get('/:id', (req, res) => salesController.getSaleById(redisClient, req, res));
    router.put('/:id', (req, res) => salesController.updateSale(redisClient, req, res));
    router.delete('/:id', (req, res) => salesController.deleteSale(redisClient, req, res));

    return router;
};
