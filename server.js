'use strict';

// Init logging
require('./logging')();

// Config
require('dotenv').config();

// Imports
logger.info("Loading dependencies...");
const express = require('express');
const bodyParser = require('body-parser');

// Database
require('./db')().then((res) => {
    // Express server
    const server = express();

    // Middleware
    logger.info("Loading middleware...");
    const log = require('./middleware/log');
    server.use(log);
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(bodyParser.json());

    // Routers
    logger.info("Registering routers...");
    const userRouter = require('./endpoints/userRouter');
    server.use('/user', userRouter);
    const challengeRouter = require('./endpoints/challengeRouter');
    server.use('/challenge', challengeRouter);

    // Index
    logger.info("Registering an index...");
    server.get('/', function (req, res) {
        res.status(200).send('Ready.');
    });

    // Startup
    logger.info("Starting server...");
    server.listen(process.env.SERVER_PORT, function(res, err) {
        logger.info("Startup complete, now listening on port " + process.env.SERVER_PORT);
    });
}, (err) => {});