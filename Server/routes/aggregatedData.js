const express = require('express');
const router = express.Router();
const aggregatedDataController = require('../controllers/aggregatedDataController');

router.get('/', aggregatedDataController.getAggregatedData);

module.exports = router;
