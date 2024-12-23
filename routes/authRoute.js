const express = require('express');

// Controllers
const { register, login } = require('../controllers/authController');

// Router
const router = express.Router();

router.route('/register').post(register);

router.route('/login').post(login);

module.exports = router;
