const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const User = require('../models/userModel');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production ') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // remove the password from the output
  user.password = undefined;
  user.passwordChangedAt = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    age: req.body.age,
    email: req.body.email,
    role: 'user',
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(newUser, 201, res);
});

exports.isBlocked = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (user.blockDate !== undefined && user.blockDate.getTime() <= Date.now()) {
    user.block = false;
    user.wrongPassword = 0;
    user.blockDate = undefined;
    await user.save({ validateBeforeSave: false });
  }

  if (user.block) {
    return next(
      new AppError(
        `You're blocked for ${parseInt(
          (user.blockDate - Date.now()) / 60000,
          10,
        )} minutes`,
        401,
      ),
    );
  }
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if user provided email and password
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }

  //check if user existed in DB
  const user = await User.findOne({ email }).select('+password'); // + is to select a field that is not selected
  if (!user) {
    return next(new AppError('No user attached to this email', 401));
  }

  // Check if password is correct
  const correct = await user.correctPassword(password, user.password);
  if (!correct) {
    // Block after 5 login times
    if (user.wrongPassword >= 2) {
      user.block = true;
      user.blockDate = new Date(Date.now() + 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          `You're blocked for ${parseInt(
            (user.blockDate - Date.now()) / 1000,
            10,
          )} minutes`,
          401,
        ),
      );
    }
    user.wrongPassword += 1;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('incorrect password', 401));
  }

  // Reset wrongPassword to zero
  user.wrongPassword = 0;
  await user.save({ validateBeforeSave: false });

  //send token
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the Token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not loged in, please login first'));
  }

  // 2) Verify the token
  // compare the secret of the token with the stored secret
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user still exists
  const existedUser = await User.findById(decoded.id);
  if (!existedUser) {
    return next(new AppError('this user is no longer existed', 401));
  }

  // 4) check if user changed password
  if (existedUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, please login', 401),
    );
  }

  // Grant the user his data and Access to protected route
  req.user = existedUser;

  next();
});

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Go to ${resetURL}, if you do not forgot it ignore the message`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset token, valid for 10 minutes',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) If user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) check if token is true and has not expired, set the new password

  if (!user) {
    return next(
      new AppError(
        `Your token has expired or you've entered an invalid token `,
      ),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) update changedPasswordaAt property
  // 4) login and send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if posted current password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
