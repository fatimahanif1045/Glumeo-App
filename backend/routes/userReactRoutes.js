const express = require('express');
const router = express.Router();
const userReactControllers = require('../controllers/userReactControllers');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/react-video', authenticateToken , userReactControllers.reactVideo);

router.get('/check-react', authenticateToken ,userReactControllers.checkReact);

module.exports = router;
