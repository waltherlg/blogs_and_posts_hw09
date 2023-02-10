
const rateLimit = require("express-rate-limit");


const rateLimiter = rateLimit({
    windowMs: 10 * 1 * 1000, // 10 sec
    max: 5,
    message: "Too many requests, please try again later",
    statusCode: 429
});

export { rateLimiter };