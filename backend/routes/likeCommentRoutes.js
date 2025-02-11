const express = require('express');
const router = express.Router();
const likeCommentController = require('../controllers/likeCommentController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/like-comment', authenticateToken , likeCommentController.likeCommentVideo);

module.exports = router;
