const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/user-signup', userController.userSignup);

router.post('/user-login' , userController.userLogin);

router.get("/current-user", authenticateToken, userController.getCurrentUserDetails);

router.put("/update-user", authenticateToken, userController.updateUser)

router.delete('/delete-user', authenticateToken, userController.deleteUser);

router.get('/user-videos', authenticateToken, userController.getAllVideos);

module.exports = router;
