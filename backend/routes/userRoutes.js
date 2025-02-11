const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/user-signup', userController.userSignup);

router.post('/user-login' , userController.userLogin);

module.exports = router;
