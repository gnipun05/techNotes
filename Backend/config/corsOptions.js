const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin, callback) => {
        if(allowedOrigins.indexOf(origin) !==-1 || !origin){ // if origin is in the allowedOrigins array or if origin is undefined (like for Postman)
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }, 
    credentials: true,
    operationsSuccessStatus: 200,
}

module.exports = corsOptions;