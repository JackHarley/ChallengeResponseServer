'use strict';

// Init logging
require('./logging')();

// Config
require('dotenv').config();

// Imports
logger.info("Loading dependencies...");
const express = require('express');
const bodyParser = require('body-parser');

// Init server
const app = express();

// Middleware
logger.info("Loading middleware...");
const log = require('./middleware/log');
app.use(log);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routers
logger.info("Registering routers...");
let keyRouter = require('./endpoints/keyRouter');
app.use('/key', keyRouter);
let userRouter = require('./endpoints/userRouter');
app.use('/user', userRouter);

// Index
logger.info("Registering an index...");
app.get('/', function (req, res) {
    res.send('Ready.');
});

// Startup
logger.info("Starting server...");
app.listen(process.env.SERVER_PORT, function(res, err) {
    logger.info("Startup complete, now listening on port " + process.env.SERVER_PORT);
});