const express = require('express');

// Controllers
const { register, login, logout } = require('../controllers/authController');

// Router
const router = express.Router();

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/logout').get(logout);

module.exports = router;
