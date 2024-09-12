const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

module.exports = (redisClient) => {
    router.get('/', (req, res) => {salesController.getSales(redisClient, req, res)});
    router.delete('/:id', salesController.deleteSale);
    router.post('/', (req, res) => {salesController.createSale(redisClient, req, res)});
    router.put('/:id', salesController.updateSale);
    router.get('/:id', salesController.getSaleById);

    return router
};
