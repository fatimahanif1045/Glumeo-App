const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/report-video', authenticateToken , reportController.reportVideo);

module.exports = router;
