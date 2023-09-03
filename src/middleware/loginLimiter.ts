import rateLimit from 'express-rate-limit';
import { logEvents } from './logger.js';

const loginLimiter = rateLimit({
    windowMs: 60 * 100,
    max: 5,
    message: { message: 'Too many login attempts from this IP, please try again after a 60 second pause' },
    handler: (req, res, next, options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default loginLimiter;
