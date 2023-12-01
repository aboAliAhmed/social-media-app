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
      {
        path: 'reacts.user',
        select: '-_id -role -age -email -__v',
      },
      {
        path: 'comments.commenter',
        select: '-_id -role -age -email -__v',
      },
      {
        path: 'comments.reacts.user',
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

exports.makeReaction = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.id;
  const { react } = req.body;

  let post = await Post.findById(postId);

  // Check if the same user, to change reaction
  const sameUser = post.reacts.some(
    (reaction) => reaction.user.toString() === userId,
  );

  // Check if the user has already reacted with the same type
  const sameReact = post.reacts.some(
    (reaction) =>
      reaction.user.toString() === userId && reaction.react === react,
  );

  // User has already reacted
  if (sameReact) {
    // Same react type, remove the existing reaction
    post = await Post.findByIdAndUpdate(
      postId,
      { $pull: { reacts: { react: react, user: userId } } },
      { new: true },
    );
  } else {
    if (sameUser) {
      // Different react type, remove the existing reaction
      post = await Post.findByIdAndUpdate(
        postId,
        { $pull: { reacts: { user: userId } } },
        { new: true },
      );
    }

    // add the reaction
    post = await Post.findByIdAndUpdate(
      postId,
      { $push: { reacts: { react: react, user: userId } } },
      { new: true },
    );
  }

  // Get the user name in the post reactions
  await Promise.all([populateUser(post)]);

  sendRes(res, post, 200);
});

exports.commentOwner = catchAsync(async (req, res, next) => {
  const { id, commentId } = req.params;
  const userId = req.user.id;

  const post = await Post.findById(id);

  // Pick the comment from the post comments
  const comment = post.comments.find(
    (el) => el._id.toString() === commentId.toString(),
  );

  if (!comment) {
    return next(new AppError('there is no comment to eddit ', 401));
  }

  // check if the user wants to delete is the comment owner
  if (userId.toString() !== comment.commenter.toString()) {
    return next(new AppError('you can only edit your comment', 401));
  }

  next();
});

exports.writeComment = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.id;
  const { content } = req.body;

  const post = await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: { content: content, commenter: userId } } },
    { new: true },
  );

  await Promise.all([populateUser(post)]);
  sendRes(res, post, 200);
});

exports.editComment = catchAsync(async (req, res, next) => {
  const { id, commentId } = req.params;
  const { newContent } = req.body;

  const post = await Post.findById(id);
  const comment = post.comments.find(
    (el) => el._id.toString() === commentId.toString(),
  );
  comment.content = newContent;
  await post.save();

  await Promise.all([populateUser(post)]);
  sendRes(res, post, 200);
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id, commentId } = req.params;

  const post = await Post.findByIdAndUpdate(
    id,
    { $pull: { comments: { _id: commentId, commenter: userId } } },
    { new: true },
  );

  await Promise.all([populateUser(post)]);
  res.status(200).json({
    status: 'Comment deleted successfully',
    post,
  });
});

exports.commentReaction = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id, commentId } = req.params;
  const { react } = req.body;

  let post = await Post.findById(id);

  const comment = post.comments.find(
    (el) => el._id.toString() === commentId.toString(),
  );

  // Check if the same user, to change reaction
  const sameUser = comment.reacts.some(
    (reaction) => reaction.user.toString() === userId,
  );

  // Check if the user has already reacted with the same type
  const sameReact = comment.reacts.some(
    (reaction) =>
      reaction.user.toString() === userId && reaction.react === react,
  );

  // User has already reacted
  if (sameReact) {
    // Same react type, remove the existing reaction
    post = await Post.findOneAndUpdate(
      { _id: id, 'comments._id': commentId },
      { $pull: { 'comments.$.reacts': { react: react, user: userId } } },
      { new: true },
    );
  } else {
    if (sameUser) {
      // Different react type, remove the existing reaction
      post = await Post.findOneAndUpdate(
        { _id: id, 'comments._id': commentId },
        { $pull: { 'comments.$.reacts': { user: userId } } },
        { new: true },
      );
    }

    // add the reaction
    post = await Post.findOneAndUpdate(
      { _id: id, 'comments._id': commentId },
      { $push: { 'comments.$.reacts': { react: react, user: userId } } },
      { new: true },
    );
  }

  // Get the user name in the post reactions
  await Promise.all([populateUser(post)]);

  sendRes(res, post, 200);
});
