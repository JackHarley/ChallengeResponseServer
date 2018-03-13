'use strict';

const express = require('express');
let router = new express.Router();

const user = require('./user/userController');
router.route('/register').post(user.postRegisterUser); // New registration
router.route('/login').post(user.postCheckCredentials); // User check credentials (login)
router.route('/verify').get(user.getVerifyUser); // User verification
router.route('/reverify').post(user.postResendVerificationEmail); // User verification email resend
router.route('/password').post(user.postSetPassword); // Change password
router.route('/forgotpassword')
	.post(user.postForgotPassword) // Forgot password
	.get(user.getForgotPassword); // Forgot password form
router.route('/forgotpassword/complete').post(user.postForgotPasswordComplete); // Forgot password complete (change password)


const userPublicKey = require('./user/userPublicKeyController');
router.route('/pubkey')
    .post(userPublicKey.postKey) // Set public key
    .get(userPublicKey.getKey); // Get public key

module.exports = router;