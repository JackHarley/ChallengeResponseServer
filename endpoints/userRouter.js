'use strict';

const express = require('express');
let router = new express.Router();

const user = require('./user/userController');
router.route('/register').post(user.postRegisterUser); // New registration
router.route('/verify').put(user.putVerifyUser); // User verification

const userPublicKey = require('./user/userPublicKeyController');
router.route('/pubkey')
    .post(userPublicKey.postKey) // Set public key
    .get(userPublicKey.getKey); // Get public key

module.exports = router;