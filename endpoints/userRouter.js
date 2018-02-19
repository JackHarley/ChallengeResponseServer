'use strict';

const express = require('express');
let router = new express.Router();

const user = require('./user/userController');
router.route('/register').post(user.postRegisterUser); // New registration
router.route('/verify').put(user.putVerifyUser); // User verification

module.exports = router;