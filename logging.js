'use strict';

const winston = require('winston');

module.exports = function() {
    global.logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: 'all',
            }),
        ],
    });
};
