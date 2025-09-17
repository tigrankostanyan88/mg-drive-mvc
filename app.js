const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require("compression");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

// live reload server
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "views")); 


dotenv.config({
    path: './.env'
});

const Server = require('./src/utils/server');
const Api = require("./src/utils/api");
const helpers = require('./src/utils/helpers');

// Error handling for the entire application.
const ctrls = require('./src/controllers');
const globalErrorHandler = ctrls.error;

const AppError = require('./src/utils/Error');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload({
    limits: {
        fileSize: 2 * 1024 * 1024
    }
}));
app.use(compression());
app.use(cookieParser());

// Middleware
app.use(connectLivereload());

// ejs settings 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Reload event
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/admin");
  }, 100);
});


if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!",
});
 
// app.use('/api', limiter);

app.use((req, res, next) => {
    req.time = Date.now();
    next();
});
// Global ERROR handler
app.use((err, req, res, next) => {
    console.error('ERROR 💥', err);
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message || 'Something went wrong',
    });
    next();
});

// // API
Api(app);

// All 404 Errors
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// // All errors
app.use(globalErrorHandler);
Server(app);