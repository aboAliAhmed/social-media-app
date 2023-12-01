const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean'); //cross-site-scripting attacks
const hpp = require('hpp'); // ttp parameter pollution

const app = express();

const globalErrorhandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const AppError = require('./utils/appError');

// MiddleWare
// Set security http headers
app.use(helmet());

// limitting requests from the same IP
const limiter = rateLimit({
  max: 100, // depends on the app
  windowMS: 60 * 60 * 1000,
  message: 'to many requests from this Ip, please try again in an hour',
});
app.use('/api', limiter);

// Body pasrser, reading the data from the body into req.body and limit it to 1MB
app.use(express.json({ limit: '1mb' }));

// Data sanitization against no sql querry injection
app.use(mongoSanitize()); // it filter out all {$ and .}

// Data sanitization against (xss)attack
app.use(xss());

//Prevent parameter pollution
app.use(hpp());

// Test middleware and get the time of the request
app.use((req, res, next) => {
  req.requestTime = new Date().toDateString();
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello There');
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this serever!`, 404));
});

// global error handling middleware
app.use(globalErrorhandler);

module.exports = app;
