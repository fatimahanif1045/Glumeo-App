const express = require('express');
const router = express.Router();
const videoReactController = require('../controllers/videoReactController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/react-video', authenticateToken , videoReactController.reactVideo);

router.get('/check-react', authenticateToken ,videoReactController.checkReact);

module.exports = router;
