const Post = require('../models/postModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Populate the user name on post document
const populateUser = async (post) => {
  await post
    .populate([
      {
        path: 'publisher',
        select: '-_id -role -age -email -__v',
      },
    ])
    .execPopulate();
};

// Send the response to the server
const sendRes = (res, doc, statusCode) => {
  res.status(statusCode).json({
    status: 'success',
    data: doc,
  });
};

// Make sure that user edit the content only
const filteredObj = (obj, ...allowedFields) => {
  const allowed = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) allowed[el] = obj[el];
  });
  return allowed;
};

exports.getAllUserPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find();

  await Promise.all(posts.map(populateUser));

  sendRes(res, posts, 200);
});

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create({
    content: req.body.content,
    publisher: req.user.id,
  });

  await Promise.all([populateUser(newPost)]);

  sendRes(res, newPost, 201);
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found for this id'));
  }

  await Promise.all([populateUser(post)]);
  sendRes(res, post, 200);
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const filteredBody = filteredObj(req.body, 'content');
  const post = await Post.findByIdAndUpdate(req.params.id, filteredBody);

  if (!post) {
    return next(new AppError('No post found for this id'));
  }

  await Promise.all([populateUser(post)]);

  sendRes(res, post, 200);
});

exports.deletePost = catchAsync(async (req, res, next) => {
  await Post.findByIdAndDelete(req.params.id);

  res.status(202).json({
    status: 'deleted',
  });
});
