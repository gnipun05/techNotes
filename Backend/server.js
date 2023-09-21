require('dotenv').config(); // after adding this, now we can access .env variables anywhere in the app
const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;

// console.log(process.env.NODE_ENV); // way to access the environment variables

connectDB(); 

app.use(logger); // we want logger to come before everything else

/* express.json() is a built-in middleware provided by the express package. It is used to parse incoming JSON payloads in the request body. When a client sends a request with a JSON payload (usually with a Content-Type: application/json header), this middleware parses the JSON data and populates req.body with the parsed JSON object. This makes it easy to work with JSON data in your route handlers. */
app.use(express.json()); 

// Third Party Middleware
app.use(cookieParser());

// this will make the API available to all the clients (makes it public)
app.use(cors(corsOptions));

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/notes', require('./routes/notesRoutes'));

app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if(req.accepts('json')){
        res.json({message: '404 Not Found'});
    } else {
        res.type('txt').send('404 Not Found');
    }
});

// this is a Custom Middleware
app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('MongoDB is connected')
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});