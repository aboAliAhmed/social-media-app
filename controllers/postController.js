const Post = require('../models/postModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUserPosts = catchAsync(async (req, res, next) => {
  const post = await Post.find();
  res.status(200).json({
    status: 'success',
    data: post,
  });
});

exports.writePost = catchAsync(async (req, res, next) => {
  const post = await Post.create(req.body);
  res.status(201).json({
    status: 'success',
    data: post,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: 'post',
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: 'psot',
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'deleted',
  });
});
