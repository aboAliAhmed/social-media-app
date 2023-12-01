const express = require('express');
const postController = require('../controllers/postController');
const reactionController = require('../controllers/reactionController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, postController.getAllUserPosts)
  .post(authController.protect, postController.createPost);

router
  .route('/:id')
  .get(authController.protect, postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

router
  .route('/:id/react')
  .patch(authController.protect, reactionController.makeReaction);

router
  .route('/:id/comment')
  .patch(authController.protect, reactionController.writeComment);

router
  .route('/:id/comment/:commentId')
  .patch(
    authController.protect,
    reactionController.commentOwner,
    reactionController.editComment,
  );

router
  .route('/:id/comment/:commentId')
  .delete(
    authController.protect,
    reactionController.commentOwner,
    reactionController.deleteComment,
  );

router
  .route('/:id/comment/:commentId/react')
  .patch(authController.protect, reactionController.commentReaction);

module.exports = router;
