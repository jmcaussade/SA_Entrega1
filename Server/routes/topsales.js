const express = require('express');
const router = express.Router();
const topsalesController  = require('../controllers/topsalesController');

router.get('/', topsalesController.getTopSellingBooks);

module.exports = router;
