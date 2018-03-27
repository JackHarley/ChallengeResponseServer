'use strict';

const express = require('express');
let router = new express.Router();

const challenge = require('./challenge/challengeController');
router.route('/begin').post(challenge.postBegin);
router.route('/lookup').get(challenge.getLookup);
router.route('/:challengeId').get(challenge.get);
router.route('/:challengeId/complete').post(challenge.postComplete);

module.exports = router;