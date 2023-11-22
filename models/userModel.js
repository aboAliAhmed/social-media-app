const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
    unique: [true, 'this name is taken'],
    trim: true,
    maxlength: [20, 'Username must be less than 20 characters'],
    minlength: [5, 'Username must be more than 5 characters'],
    validate: {
      validator: (value) => validator.isAlphanumeric(value),
      message: 'Name can only contain letters and numbers',
    },
  },
  age: {
    type: Number,
    min: [12, 'You are still too young'],
    max: [150, `Aren't you getting a bit old?`],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Please provide a valid email address',
    },
  },
  role: {
    type: String,
    enum: ['user', 'modrator', 'admin'],
    default: 'user',
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [9, 'Password must be 9 characters or more'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'password are not the same',
    },
    function(value) {
      return value === this.password;
    },
  },
  passwordChangedAt: { type: Date, select: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //only run if password is modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //explicit the inactive accounts
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changingTimeInseconds = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimeStamp < changingTimeInseconds;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //generate a plain token => not hashed
  const resetToken = crypto
    .randomBytes(32) // 32 is for number of caracters
    .toString('hex'); // convert it to hexadecimal string

  // create hash with 'sha256' algorithem
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken) // update the token
    .digest('hex'); // store it as a hexadecimal

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

// Create indexes
User.createIndexes();

module.exports = User;
