'use strict';

const express = require('express');
let router = new express.Router();

const challenge = require('./challenge/challengeController');
router.route('/begin').post(challenge.postBegin); // begin/generate challenge, needs recipient email, returns a challenge_id and pin
router.route('/lookup').get(challenge.getLookup); // lookup a challenge by recipient email + pin
router.route('/:challengeId').get(challenge.get); // get challenge info, ?pin=x must be supplied
//router.route('/:challengeId/complete').post(challenge.postComplete); // respond to challenge, requires the pin and a signature

module.exports = router;