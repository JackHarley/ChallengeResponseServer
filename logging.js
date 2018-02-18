'use strict';

const winston = require('winston');

let logger;

module.exports = function() {
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: 'all',
            }),
        ],
    });

    global.logger = logger;
};
