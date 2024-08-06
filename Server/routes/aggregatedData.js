const express = require('express');
const router = express.Router();
const aggregatedDataController = require('../controllers/aggregatedDataController');

// Route to get aggregated data
router.get('/', aggregatedDataController.getAggregatedData);

module.exports = router;
