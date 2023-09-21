const rateLimit = require('express-rate-limit');
const { logEvents } = require('./logger');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 Login requests per 'window' per minute
    message: 
        { message: 'Too many login attempts from this IP, please try again after 60 second pause' },
    handler: (req, res, next, options) =>{ // handler handles the scenario when the limit is exceeded
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');
        res.status(options.statusCode).send(options.message);
    },
    // the below given options are set to true by default (reccomended to add as per the documentation)
    standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
    legacyHeaders: true, // Disable the 'X-RateLimit-*' headers
});

module.exports = loginLimiter; 