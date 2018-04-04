'use strict';

const logger = global.logger;

module.exports = function(req, res, next) {
    let t0 = process.hrtime();
    let resEnd = res.end;

    res.end = (chunk, encoding) => {
        let t1 = process.hrtime();
        let te = ((t1[0] * 1e9 + t1[1]) - (t0[0] * 1e9 + t0[1])) / 10000000;
        let ipAddress = (req.headers.hasOwnProperty('x-forwarded-for')) ? req.headers['x-forwarded-for'] : req.ip;
        logger.info('Request from "%s" [%s %s] %s %sms', ipAddress, req.method, req.originalUrl, res.statusCode, te);
        res.end = resEnd;
        res.end(chunk, encoding);
    };
    next();
};
