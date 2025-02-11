const express = require('express');
const router = express.Router();
const nearByPlacesController = require('../controllers/nearByPlacesController');

router.get('/get-near-by-places', nearByPlacesController.getNearByPlaces);

module.exports = router;
