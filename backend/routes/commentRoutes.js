const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/comment-video', authenticateToken , commentController.commentVideo);

router.get('/check-comment', authenticateToken ,commentController.checkComment);

router.delete('/delete-comment', authenticateToken , commentController.deleteComment);

router.delete('/delete-all-comment', authenticateToken , commentController.deleteAllComment);

router.put('/edit-comment', authenticateToken , commentController.editComment);

module.exports = router;
