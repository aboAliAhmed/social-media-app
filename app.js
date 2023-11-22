const express = require('express');

const app = express();
app.use(express.json());

const globalErrorhandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const AppError = require('./utils/appError');

// middleWare
app.use((req, res, next) => {
  req.requestTime = new Date().toDateString;
  // console.log(req.headers);

  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello There');
});

app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this serever!`, 404));
});

// global error handling middleware
app.use(globalErrorhandler);

module.exports = app;
