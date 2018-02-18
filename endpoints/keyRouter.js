'use strict';

const express = require('express');
let router = new express.Router();

const key = require('./key/keyController');
//router.route('/lookup').post(key.postLookupKey); // Lookup key by email

module.exports = router;