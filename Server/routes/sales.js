const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

module.exports = (redisClient) => {
    router.get('/', (req, res) => {salesController.getSales(redisClient, req, res)});
    router.delete('/:id', salesController.deleteSale);
    router.post('/', salesController.createSale);
    router.put('/:id', salesController.updateSale);
    router.get('/:id', salesController.getSaleById);
    
    return router
};
