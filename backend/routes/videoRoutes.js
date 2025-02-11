const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/upload-video', authenticateToken , videoController.uploadVideo);

router.post('/upload-video-device-id' , videoController.uploadVideoDeviceId);

router.post('/upload-video-information', authenticateToken , videoController.uploadVideoInfo);

router.delete('/delete-video', authenticateToken , videoController.deleteVideo);

router.get('/get-videos', authenticateToken , videoController.getVideos);

module.exports = router;
