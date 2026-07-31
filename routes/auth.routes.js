const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { isGuest } = require('../middlewares/auth.middleware');

router.get('/login', isGuest, authController.getLoginPage);
router.post('/login', isGuest, authController.login);
router.get('/logout', authController.logout);

module.exports = router;
