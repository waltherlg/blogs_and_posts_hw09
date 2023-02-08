import expressRateLimit from 'express-rate-limit';

export function authRateLimiter() {
    return expressRateLimit({
        windowMs: 10 * 1 * 1000, // 10 sec
        max: 5, // limit each IP to 5 requests per windowMs
        message: 'Too many requests, please try again later',
        handler: (req, res) => {
            res.status(429).send({ error: 'Too many requests, please try again later' });
        }
    });
};